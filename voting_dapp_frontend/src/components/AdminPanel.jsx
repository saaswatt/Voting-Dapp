import { useState } from "react";
import { getContract } from "../hooks/useWallet";
import { useElectionContext } from "../context/ElectionContext";

export default function AdminPanel() {
  const [candidateName, setCandidateName] = useState("");
  const [duration, setDuration] = useState("");

  const { activeElectionId, setActiveElectionId } = useElectionContext();

  /* ===============================
        STYLES (INLINE, MINIMAL)
  =============================== */

  const containerStyle = {
    backgroundColor: "#1e1e1e",
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const panelStyle = {
    border: "1.5px solid #ffffff",
    borderRadius: "12px",
    padding: "32px",
    width: "420px",
    textAlign: "center",
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
  };

  const sectionStyle = {
    marginTop: "22px",
  };

  const inputStyle = {
    width: "90%",
    padding: "8px",
    margin: "8px 0",
    backgroundColor: "#2a2a2a",
    border: "1px solid #555",
    color: "#ffffff",
    borderRadius: "6px",
    outline: "none",
  };

  const buttonStyle = {
    padding: "8px 16px",
    margin: "6px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #888",
    color: "#ffffff",
    borderRadius: "6px",
    cursor: "pointer",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    border: "1px solid #ff4d4d",
    color: "#ff4d4d",
  };

  /* ===============================
        CONTRACT ACTIONS
  =============================== */

  const createElection = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.createElection();
      await tx.wait();

      const id = await contract.activeElectionId();
      setActiveElectionId(id.toNumber());
    } catch (err) {
      alert(err.reason || err.message || "Failed to create election");
    }
  };

  const addCandidate = async () => {
    if (!candidateName.trim()) return;

    const contract = await getContract();
    const tx = await contract.addCandidate(activeElectionId, candidateName);
    await tx.wait();
    setCandidateName("");
  };

  const startRegistration = async () => {
    const contract = await getContract();
    const tx = await contract.startRegistration(
      activeElectionId,
      Number(duration)
    );
    await tx.wait();
    setDuration("");
  };

  const startVoting = async () => {
    const contract = await getContract();
    const tx = await contract.startVoting(
      activeElectionId,
      Number(duration)
    );
    await tx.wait();
    setDuration("");
  };

  const endElection = async () => {
    const confirmEnd = window.confirm(
      "This will permanently end the election. Continue?"
    );
    if (!confirmEnd) return;

    const contract = await getContract();
    const tx = await contract.endElection(activeElectionId);
    await tx.wait();
  };

  /* ===============================
            UI
  =============================== */

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2>Admin Control Panel</h2>

        {activeElectionId ? (
          <p style={{ color: "#4da6ff" }}>
            Active Election ID: {activeElectionId}
          </p>
        ) : (
          <p style={{ color: "#ffcc00" }}>
            No active election
          </p>
        )}

        <div style={sectionStyle}>
          <button style={buttonStyle} onClick={createElection}>
            Create New Election
          </button>
        </div>

        <hr style={{ borderColor: "#444", margin: "22px 0" }} />

        <div style={sectionStyle}>
          <input
            style={inputStyle}
            placeholder="Candidate name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
          <br />
          <button
            style={buttonStyle}
            onClick={addCandidate}
            disabled={!activeElectionId}
          >
            Add Candidate
          </button>
        </div>

        <div style={sectionStyle}>
          <input
            style={inputStyle}
            placeholder="Duration (seconds)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <br />
          <button
            style={buttonStyle}
            onClick={startRegistration}
            disabled={!activeElectionId}
          >
            Start Registration
          </button>
          <button
            style={buttonStyle}
            onClick={startVoting}
            disabled={!activeElectionId}
          >
            Start Voting
          </button>
        </div>

        <div style={sectionStyle}>
          <button
            style={dangerButtonStyle}
            onClick={endElection}
            disabled={!activeElectionId}
          >
            End Election
          </button>
        </div>
      </div>
    </div>
  );
}
