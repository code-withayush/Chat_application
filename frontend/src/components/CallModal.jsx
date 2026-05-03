import { useEffect, useRef, useState } from "react";
import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";

export default function CallModal({ callType, otherUser, socket, targetUserId, onEnd, isIncoming, onAccept, onReject }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [status, setStatus] = useState(isIncoming ? "incoming" : "calling");
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!isIncoming) startCall();
    return () => endCall();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("webrtc:offer", async ({ offer }) => {
      await setupPC();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("webrtc:answer", { targetUserId, answer });
      setStatus("connected");
    });

    socket.on("webrtc:answer", async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setStatus("connected");
    });

    socket.on("webrtc:ice-candidate", ({ candidate }) => {
      pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("call:ended", () => endCall());

    return () => {
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
      socket.off("call:ended");
    };
  }, [socket]);

  const setupPC = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc:ice-candidate", { targetUserId, candidate: e.candidate });
      }
    };

    return pc;
  };

  const startCall = async () => {
    const pc = await setupPC();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("webrtc:offer", { targetUserId, offer });
  };

  const acceptCall = async () => {
    setStatus("connected");
    socket.emit("call:accepted", { callerId: targetUserId });
    onAccept?.();
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    socket.emit("call:ended", { targetUserId });
    onEnd?.();
  };

  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setMuted(!muted); }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; setVideoOff(!videoOff); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center gap-6">
      {/* Remote Video */}
      {callType === "video" && (
        <div className="relative w-full max-w-2xl h-96 bg-dark-200 rounded-2xl overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {/* Local Video (small) */}
          <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-3 right-3 w-32 h-24 rounded-xl object-cover border-2 border-white/20" />
        </div>
      )}

      {/* Audio only */}
      {callType === "audio" && (
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
            style={{ backgroundColor: otherUser?.avatarColor || "#7C3AED" }}
          >
            {otherUser?.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="text-white text-xl font-bold">{otherUser?.name}</h2>
          <p className="text-white/50 text-sm">
            {status === "incoming" ? "Incoming call..." : status === "calling" ? "Calling..." : "Connected"}
          </p>
          <audio ref={remoteVideoRef} autoPlay />
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-4">
        {status === "incoming" ? (
          <>
            <button onClick={acceptCall} className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
              <FiVideo className="w-6 h-6 text-white" />
            </button>
            <button onClick={() => { socket.emit("call:rejected", { callerId: targetUserId }); onReject?.(); }} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
              <FiPhoneOff className="w-6 h-6 text-white" />
            </button>
          </>
        ) : (
          <>
            <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center ${muted ? "bg-red-500" : "bg-white/10"}`}>
              {muted ? <FiMicOff className="w-5 h-5 text-white" /> : <FiMic className="w-5 h-5 text-white" />}
            </button>
            {callType === "video" && (
              <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center ${videoOff ? "bg-red-500" : "bg-white/10"}`}>
                {videoOff ? <FiVideoOff className="w-5 h-5 text-white" /> : <FiVideo className="w-5 h-5 text-white" />}
              </button>
            )}
            <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
              <FiPhoneOff className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}