import { useState } from "react";
import { getContract } from "../hooks/useWallet";
import { useElectionContext } from "../context/ElectionContext";

export default function AdminPanel() {
  const [candidateName, setCandidateName] = useState("");
  const [duration, setDuration] = useState("");

  const { activeElectionId, setActiveElectionId } = useElectionContext();

  /* ===============================
        CREATE NEW ELECTION
  =============================== */
  const createElection = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.createElection();
      await tx.wait();

      const id = await contract.activeElectionId();
      setActiveElectionId(id.toNumber());

      alert(`New election created (ID: ${id})`);
    } catch (err) {
      console.error(err);
      alert(err.reason || err.message || "Failed to create election");
    }
  };

  /* ===============================
        ADMIN ACTIONS
  =============================== */
  const addCandidate = async () => {
    if (!activeElectionId) {
      alert("No active election");
      return;
    }

    const contract = await getContract();
    const tx = await contract.addCandidate(
      activeElectionId,
      candidateName
    );
    await tx.wait();

    alert("Candidate added");
    setCandidateName("");
  };

  const startRegistration = async () => {
    const contract = await getContract();
    const tx = await contract.startRegistration(
      activeElectionId,
      Number(duration)
    );
    await tx.wait();

    alert("Registration started");
    setDuration("");
  };

  const startVoting = async () => {
    const contract = await getContract();
    const tx = await contract.startVoting(
      activeElectionId,
      Number(duration)
    );
    await tx.wait();

    alert("Voting started");
    setDuration("");
  };

  const endElection = async () => {
    const contract = await getContract();
    const tx = await contract.endElection(activeElectionId);
    await tx.wait();

    alert("Election ended");
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      {/* CREATE ELECTION */}
      <button onClick={createElection}>
        Create New Election
      </button>

      {activeElectionId && (
        <p>
          <strong>Active Election ID:</strong> {activeElectionId}
        </p>
      )}

      <hr />

      {/* ADD CANDIDATE */}
      <input
        placeholder="Candidate name"
        value={candidateName}
        onChange={(e) => setCandidateName(e.target.value)}
      />
      <button onClick={addCandidate}>Add Candidate</button>

      <br /><br />

      {/* PHASE CONTROLS */}
      <input
        placeholder="Duration (seconds)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <br />

      <button onClick={startRegistration}>
        Start Registration
      </button>
      <button onClick={startVoting}>
        Start Voting
      </button>

      <br /><br />

      <button onClick={endElection}>
        End Election
      </button>
    </div>
  );
}
