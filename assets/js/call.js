// Live lessons: voice and video calls between a teacher and a class.
// Every participant connects to every other (mesh), which works well for
// classroom-sized groups. Signalling travels over a private Supabase
// Realtime channel that only members of the class can join (RLS on realtime.messages).
import { h, icon, avatar, toast, sound } from "./ui.js";
import { t } from "./i18n.js";

const ICE = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];

export async function openMeeting({ client, meeting, me, onClose }) {
  const isTeacher = me.role === "teacher";
  const topic = `class:${meeting.classroom_id}:meet:${meeting.id}`;
  const peers = new Map(); // id -> { pc, name, tile, video, stream, pending: [], audioSender, videoSender }
  let local = new MediaStream();
  let camTrack = null, micTrack = null, screenTrack = null;
  let micOn = true, camOn = meeting.kind === "video", handUp = false, closed = false;

  // ── UI ──
  const tiles = h("div", { class: "tiles" });
  const msgs = h("div", { class: "msgs" });
  const chatInput = h("input", { placeholder: t("chat") + "…", maxlength: 500 });
  const side = h("div", { class: "meet-side hidden" }, h("div", { class: "row", style: { padding: "12px" } }, h("b", {}, t("chat")), h("span", { class: "spacer" }), h("button", { class: "icon-btn", style: { color: "#fff" }, onClick: () => side.classList.add("hidden") }, icon("x"))),
    msgs, h("form", { onSubmit: (e) => { e.preventDefault(); sendChat(); } }, chatInput, h("button", { class: "btn sm" }, t("send"))));
  const status = h("span", { class: "muted small" }, t("connecting"));
  const btnMic = h("button", { class: "mbtn", title: t("mic"), onClick: toggleMic }, icon("mic"));
  const btnCam = h("button", { class: "mbtn", title: t("camera"), onClick: toggleCam }, icon("cam"));
  const btnScreen = h("button", { class: "mbtn", title: t("share"), onClick: toggleScreen }, icon("screen"));
  const btnHand = h("button", { class: "mbtn", title: t("raiseHand"), onClick: toggleHand }, icon("hand"));
  const btnChat = h("button", { class: "mbtn", title: t("chat"), onClick: () => side.classList.toggle("hidden") }, icon("chat"));
  const btnEnd = h("button", { class: "mbtn end", title: isTeacher ? "End for everyone" : t("leave"), onClick: () => leave(isTeacher) }, icon("phone"));
  const root = h("div", { class: "meet" },
    h("div", { class: "meet-top" }, h("span", { class: "live" }, "LIVE"), h("b", {}, meeting.title || "Live lesson"), h("span", { class: "pill" }, meeting.kind === "video" ? icon("cam") : icon("mic"), meeting.kind === "video" ? "Video" : "Voice"), h("span", { class: "spacer" }), status),
    h("div", { class: "meet-body" }, tiles, side),
    h("div", { class: "meet-bar" }, btnMic, btnCam, btnScreen, btnHand, btnChat, btnEnd));
  document.body.append(root);

  // ── local media ──
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: camOn ? { width: { ideal: 640 }, height: { ideal: 480 } } : false });
    micTrack = s.getAudioTracks()[0] || null; camTrack = s.getVideoTracks()[0] || null;
  } catch {
    try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); micTrack = s.getAudioTracks()[0]; camOn = false; }
    catch { toast(t("mediaDenied"), "bad"); micOn = false; camOn = false; }
  }
  local = new MediaStream([micTrack, camTrack].filter(Boolean));
  const myTile = makeTile(me.id, me.name + ` (${t("you")})`, true);
  myTile.video.srcObject = local; myTile.video.muted = true;
  refreshButtons(); refreshTile(myTile, !!(camTrack || screenTrack));

  function makeTile(id, name, mine = false) {
    const video = h("video", { autoplay: true, playsinline: true });
    if (mine) video.muted = true;
    const ph = h("div", { class: "ph" }, avatar(name, mine ? "#1cb0f6" : "#58cc02", 84));
    const hand = h("div", { class: "hand-up hidden" }, icon("hand"));
    const who = h("div", { class: "who" }, name);
    const el = h("div", { class: "tile-v" }, video, ph, who, hand);
    if (isTeacher === false && id === meeting.teacher_id) tiles.prepend(el); else tiles.append(el);
    return { el, video, ph, hand, who };
  }
  function refreshTile(tile, hasVideo) { tile.video.classList.toggle("hidden", !hasVideo); tile.ph.classList.toggle("hidden", hasVideo); }
  function refreshButtons() {
    btnMic.classList.toggle("off", !micOn); btnMic.replaceChildren(icon(micOn ? "mic" : "micOff"));
    btnCam.classList.toggle("off", !camOn); btnCam.replaceChildren(icon(camOn ? "cam" : "camOff"));
    btnScreen.classList.toggle("on", !!screenTrack);
    btnHand.classList.toggle("on", handUp);
    if (!navigator.mediaDevices?.getDisplayMedia) btnScreen.classList.add("hidden");
  }

  // ── signalling ──
  await client.realtime.setAuth();
  const ch = client.channel(topic, { config: { private: true, broadcast: { self: false }, presence: { key: me.id } } });
  const send = (event, payload) => ch.send({ type: "broadcast", event, payload: { ...payload, from: me.id, name: me.name } });

  ch.on("presence", { event: "sync" }, () => {
    const state = ch.presenceState();
    const ids = Object.keys(state).filter(id => id !== me.id);
    for (const id of ids) {
      const info = state[id][0] || {};
      if (!peers.has(id) && me.id < id) connect(id, info.name || "…", true);
    }
    for (const id of [...peers.keys()]) if (!ids.includes(id)) drop(id);
    status.textContent = ids.length ? `${ids.length + 1} in the lesson` : (isTeacher ? "Waiting for students…" : t("waitingTeacher"));
  });
  ch.on("broadcast", { event: "signal" }, async ({ payload }) => {
    if (payload.to !== me.id) return;
    let p = peers.get(payload.from);
    if (!p) p = connect(payload.from, payload.name, false);
    try {
      if (payload.description) {
        await p.pc.setRemoteDescription(payload.description);
        if (payload.description.type === "offer") {
          attachLocalToTransceivers(p);
          await p.pc.setLocalDescription(await p.pc.createAnswer());
          send("signal", { to: payload.from, description: p.pc.localDescription.toJSON() });
        }
        for (const c of p.pending.splice(0)) await p.pc.addIceCandidate(c).catch(() => {});
      } else if (payload.candidate) {
        if (p.pc.remoteDescription) await p.pc.addIceCandidate(payload.candidate).catch(() => {});
        else p.pending.push(payload.candidate);
      }
    } catch (e) { console.warn("signal error", e); }
  });
  ch.on("broadcast", { event: "chat" }, ({ payload }) => addMsg(payload.name, payload.text));
  ch.on("broadcast", { event: "hand" }, ({ payload }) => {
    const p = peers.get(payload.from); if (p) p.tile.hand.classList.toggle("hidden", !payload.up);
    if (payload.up) { sound.tap(); toast(`${payload.name}: ${t("raiseHand")}`); }
  });
  ch.on("broadcast", { event: "end" }, () => { toast(t("meetingEnded")); leave(false); });

  await new Promise((res) => ch.subscribe(async (s) => {
    if (s === "SUBSCRIBED") { await ch.track({ name: me.name, role: me.role }); res(); }
    if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") { status.textContent = "Connection problem — retrying…"; }
  }));

  function connect(id, name, initiator) {
    const pc = new RTCPeerConnection({ iceServers: ICE });
    const tile = makeTile(id, name);
    const stream = new MediaStream();
    tile.video.srcObject = stream;
    const p = { pc, name, tile, stream, pending: [], audioSender: null, videoSender: null };
    peers.set(id, p);
    if (initiator) {
      p.audioSender = pc.addTransceiver(micTrack || "audio", { direction: "sendrecv" }).sender;
      p.videoSender = pc.addTransceiver(screenTrack || (camOn ? camTrack : null) || "video", { direction: "sendrecv" }).sender;
    }
    pc.ontrack = (e) => {
      stream.addTrack(e.track);
      const upd = () => refreshTile(tile, stream.getVideoTracks().some(tr => !tr.muted && tr.readyState === "live"));
      e.track.onunmute = upd; e.track.onmute = upd; e.track.onended = upd; upd();
      if (e.track.kind === "audio") watchSpeaking(stream, tile.el);
      tile.video.play().catch(() => {});
    };
    pc.onicecandidate = (e) => { if (e.candidate) send("signal", { to: id, candidate: e.candidate.toJSON() }); };
    pc.onconnectionstatechange = () => { if (pc.connectionState === "failed") { toast(`Connection to ${name} failed (network may block calls)`, "bad"); } };
    pc.onnegotiationneeded = async () => {
      if (!initiator) return;
      try { await pc.setLocalDescription(await pc.createOffer()); send("signal", { to: id, description: pc.localDescription.toJSON() }); } catch (e) { console.warn(e); }
    };
    return p;
  }
  function attachLocalToTransceivers(p) {
    for (const tr of p.pc.getTransceivers()) {
      const kind = tr.receiver.track.kind;
      tr.direction = "sendrecv";
      if (kind === "audio") { p.audioSender = tr.sender; tr.sender.replaceTrack(micTrack || null); }
      if (kind === "video") { p.videoSender = tr.sender; tr.sender.replaceTrack(screenTrack || (camOn ? camTrack : null)); }
    }
  }
  function drop(id) { const p = peers.get(id); if (!p) return; p.pc.close(); p.tile.el.remove(); peers.delete(id); }
  function eachVideoSender(fn) { for (const p of peers.values()) if (p.videoSender) fn(p.videoSender); }

  // ── controls ──
  function toggleMic() {
    if (!micTrack) { toast(t("mediaDenied"), "bad"); return; }
    micOn = !micOn; micTrack.enabled = micOn; refreshButtons();
  }
  async function toggleCam() {
    if (camOn) {
      camOn = false; if (!screenTrack) eachVideoSender(s => s.replaceTrack(null));
      if (camTrack) { camTrack.stop(); local.removeTrack(camTrack); camTrack = null; }
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } });
        camTrack = s.getVideoTracks()[0]; camOn = true; local.addTrack(camTrack);
        if (!screenTrack) eachVideoSender(snd => snd.replaceTrack(camTrack));
      } catch { toast(t("mediaDenied"), "bad"); }
    }
    if (!screenTrack) { myTile.video.srcObject = new MediaStream([camTrack].filter(Boolean)); refreshTile(myTile, !!camTrack); }
    refreshButtons();
  }
  async function toggleScreen() {
    if (screenTrack) return stopScreen();
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenTrack = s.getVideoTracks()[0];
      screenTrack.onended = stopScreen;
      eachVideoSender(snd => snd.replaceTrack(screenTrack));
      myTile.video.srcObject = new MediaStream([screenTrack]); myTile.video.classList.add("contain"); refreshTile(myTile, true);
      refreshButtons();
    } catch {}
  }
  function stopScreen() {
    if (!screenTrack) return;
    screenTrack.stop(); screenTrack = null;
    eachVideoSender(snd => snd.replaceTrack(camOn ? camTrack : null));
    myTile.video.srcObject = new MediaStream([camTrack].filter(Boolean)); myTile.video.classList.remove("contain"); refreshTile(myTile, !!camTrack && camOn);
    refreshButtons();
  }
  function toggleHand() { handUp = !handUp; myTile.hand.classList.toggle("hidden", !handUp); send("hand", { up: handUp }); refreshButtons(); }
  function sendChat() { const text = chatInput.value.trim(); if (!text) return; chatInput.value = ""; addMsg(me.name, text); send("chat", { text }); }
  function addMsg(name, text) { msgs.append(h("div", { class: "msg" }, h("b", {}, name), " ", text)); msgs.scrollTop = msgs.scrollHeight; if (side.classList.contains("hidden")) btnChat.classList.add("on"); }
  btnChat.addEventListener("click", () => btnChat.classList.remove("on"));

  const audioCtx = (() => { try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } })();
  function watchSpeaking(stream, el) {
    if (!audioCtx) return;
    try {
      const src = audioCtx.createMediaStreamSource(stream); const an = audioCtx.createAnalyser(); an.fftSize = 512; src.connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      const loop = () => { if (closed) return; an.getByteFrequencyData(data); const v = data.reduce((a, b) => a + b, 0) / data.length; el.classList.toggle("speaking", v > 18); requestAnimationFrame(loop); };
      loop();
    } catch {}
  }

  async function leave(endForAll) {
    if (closed) return; closed = true;
    if (endForAll) {
      send("end", {});
      await client.from("meetings").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", meeting.id);
    }
    for (const id of [...peers.keys()]) drop(id);
    [micTrack, camTrack, screenTrack].forEach(tr => tr && tr.stop());
    try { await ch.untrack(); } catch {}
    client.removeChannel(ch);
    audioCtx && audioCtx.close();
    root.remove();
    onClose && onClose();
  }
  return { leave };
}
