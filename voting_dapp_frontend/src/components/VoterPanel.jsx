import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../hooks/useWallet";
import { useElectionContext } from "../context/ElectionContext";

const STATES = ["Created", "Registration Open", "Voting Open", "Ended"];

export default function VoterPanel() {
  const { activeElectionId } = useElectionContext();

  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [candidateId, setCandidateId] = useState("");

  const [candidates, setCandidates] = useState([]);
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    color: "#ffffff",
  };

  const panelStyle = {
    border: "1.5px solid #ffffff",
    borderRadius: "12px",
    padding: "32px",
    width: "450px",
    textAlign: "center",
    backgroundColor: "#1e1e1e",
  };

  const sectionStyle = {
    marginTop: "20px",
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

  const errorBoxStyle = {
    border: "1.5px solid #ff4d4d",
    color: "#ff4d4d",
    padding: "10px",
    borderRadius: "6px",
    marginTop: "15px",
    fontWeight: "bold",
  };

  /* ===============================
        LOAD ELECTION DATA
  =============================== */

  useEffect(() => {
    if (!activeElectionId) return;
    loadElectionData();
    // eslint-disable-next-line
  }, [activeElectionId]);

  const loadElectionData = async () => {
    try {
      setLoading(true);
      setError("");

      const contract = await getContract();

      const currentState = await contract.getElectionState(activeElectionId);
      setState(STATES[currentState]);

      const count = await contract.getCandidateCount(activeElectionId);

      const temp = [];
      for (let i = 1; i <= count; i++) {
        const c = await contract.getCandidate(activeElectionId, i);
        temp.push({
          id: c.id.toNumber(),
          name: c.name,
          votes: c.voteCount.toNumber(),
        });
      }

      setCandidates(temp);
    } catch (err) {
      setError(err.reason || err.message || "Failed to load election data");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
        REGISTRATION
  =============================== */

  const register = async () => {
    try {
      setError("");

      if (regNo.length !== 10 || !regNo.startsWith("22") || !name.trim()) {
        setError("Invalid Registration Number or Name");
        return;
      }

      const contract = await getContract();
      const salt = await contract.getEventSalt(activeElectionId);

      const identityHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["string", "string", "bytes32"],
          [regNo.trim(), name.trim().toLowerCase(), salt]
        )
      );

      const tx = await contract.registerVoter(activeElectionId, identityHash);
      await tx.wait();

      setRegNo("");
      setName("");
    } catch (err) {
      setError(
        err.reason ||
        err.message ||
        "Registration failed (duplicate wallet or time over)"
      );
    }
  };

  /* ===============================
            VOTING
  =============================== */

  const vote = async () => {
    try {
      setError("");

      if (!candidateId) {
        setError("Please enter a valid Candidate ID");
        return;
      }

      const contract = await getContract();
      const tx = await contract.vote(activeElectionId, Number(candidateId));
      await tx.wait();

      setCandidateId("");
      loadElectionData();
    } catch (err) {
      setError(
        err.reason ||
        err.message ||
        "Voting failed (already voted or voting closed)"
      );
    }
  };

  /* ===============================
            WINNER LOGIC
  =============================== */

  const winner =
    candidates.length > 0
      ? candidates.reduce((max, c) => (c.votes > max.votes ? c : max))
      : null;

  /* ===============================
            UI
  =============================== */

  if (loading) {
    return (
      <div style={containerStyle}>
        <p>Loading election data...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2>Voter Panel</h2>

        <p>
          <strong>Election Status:</strong>{" "}
          <span style={{ color: "#4da6ff" }}>{state}</span>
        </p>

        {error && <div style={errorBoxStyle}>{error}</div>}

        {/* REGISTRATION */}
        {state === "Registration Open" && (
          <div style={sectionStyle}>
            <h3>Registration</h3>
            <input
              style={inputStyle}
              placeholder="Registration Number"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button style={buttonStyle} onClick={register}>
              Register
            </button>
          </div>
        )}

        {/* VOTING */}
        {state === "Voting Open" && (
          <div style={sectionStyle}>
            <h3>Voting</h3>

            {candidates.map((c) => (
              <p key={c.id}>
                {c.id}. {c.name}
              </p>
            ))}

            <input
              style={inputStyle}
              placeholder="Candidate ID"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
            />
            <button style={buttonStyle} onClick={vote}>
              Cast Vote
            </button>
          </div>
        )}

        {/* RESULTS */}
        {state === "Ended" && winner && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "26px" }}>Winner is:</h2>
            <h1 style={{ color: "#00ffcc", fontSize: "32px" }}>
              {winner.name}
            </h1>
            <p style={{ color: "#cccccc" }}>
              Votes received: {winner.votes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
