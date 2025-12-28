import { useEffect, useState } from "react";
import WalletConnect from "./components/WalletConnect";
import AdminPanel from "./components/AdminPanel";
import VoterPanel from "./components/VoterPanel";
import { getContract } from "./hooks/useWallet";
import { useElectionContext } from "./context/ElectionContext";

function App() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { activeElectionId, loadingElection } = useElectionContext();

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

  const boxStyle = {
    border: "1.5px solid #ffffff",
    borderRadius: "14px",
    padding: "56px 60px",
    textAlign: "center",
    backgroundColor: "#1e1e1e",
    minWidth: "460px",
  };

  const welcomeStyle = {
    fontSize: "18px",
    letterSpacing: "1px",
    marginBottom: "8px",
    color: "#cccccc",
  };

  const titleStyle = {
    fontSize: "44px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    marginBottom: "10px",
  };

  const taglineStyle = {
    fontSize: "15px",
    color: "#bbbbbb",
    marginBottom: "26px",
  };

  const dividerStyle = {
    borderTop: "1px solid #ffffff",
    opacity: 0.25,
    margin: "26px 0 34px 0",
  };

  const connectButtonWrapperStyle = {
    transform: "scale(1.15)",
    display: "inline-block",
  };

  /* ===============================
        ACCOUNT CHANGE HANDLER
  =============================== */

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsAdmin(false);
      } else {
        setAccount(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  /* ===============================
        ADMIN CHECK
  =============================== */

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      if (!account) {
        if (mounted) setIsAdmin(false);
        return;
      }

      try {
        const contract = await getContract();
        const admin = await contract.admin();

        if (mounted) {
          setIsAdmin(admin.toLowerCase() === account.toLowerCase());
        }
      } catch (err) {
        console.error(err);
        if (mounted) setIsAdmin(false);
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [account]);

  /* ===============================
              UI
  =============================== */

  if (loadingElection) {
    return (
      <div style={containerStyle}>
        <p>Loading election...</p>
      </div>
    );
  }

  /* ===== LANDING PAGE ===== */
  if (!account) {
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <div style={welcomeStyle}>Welcome to</div>

          <div style={titleStyle}>Voting DApp</div>

          <div style={taglineStyle}>
            A decentralized, tamper-resistant voting system
          </div>

          <div style={dividerStyle} />

          <div style={connectButtonWrapperStyle}>
            <WalletConnect setAccount={setAccount} />
          </div>
        </div>
      </div>
    );
  }

  /* ===== WALLET CONNECTED ===== */
  return (
    <>
      {isAdmin ? (
        <AdminPanel />
      ) : activeElectionId ? (
        <VoterPanel />
      ) : (
        <div style={containerStyle}>
          <div style={boxStyle}>
            <p>No active election yet.</p>
            <p>Please wait for admin.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
