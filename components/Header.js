import Link from "next/link"; // Dynamic routing
import { useState, useEffect } from "react"; // State management
import Button from "./Button";
import { authAlgo } from "@containers/index"; // Global state
import { useRouter } from "next/router"; // Router
//import { AlgoButton, AlgoSendButton, Pipeline} from 'pipeline-express-react'

// Header
export default function Header() {
  const router = useRouter(); // Router navigation
  const [loading, setLoading] = useState(false); // Loading state
  const [ myAlgoWallet, setMyAlgoWallet] = useState(null);
  const { address, authenticateAlgo, killSession } = authAlgo.useContainer(); // Global state
  
  const authenticateWithLoading = async () => {
    setLoading(true); // Toggle loading
    await authenticateAlgo(); // Authenticate
    setLoading(false); // Toggle loading
  }

  const disconnect = async () => {
     killSession();
     console.log('Disconnect');
     router.push("/");
  }

   useEffect(() => { 
     //myAlgoWallet = Pipeline.init();
   }, [] );

  return (
    <div>
      <style jsx>
              {`
                .header {
                  padding: 15px 30px 0px 30px;
                  max-width: 1100px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  z-index: 9999;
                }
                .headerLogo {
                  justify-content: flex-start;
                  width: 80px;
                  height: 60px;
                }
                .headerMenu {
                  color: #fff;
                  background-color: #0b5468;
                  padding: 13px 35px;
                  font-weight: 1000;
                  font-size: 16px;
                  margin: 0px 5px;
                }
              `}
      </style>
      <div className="header">
          <Link href="/">
            <a> <img className="headerLogo" src="/drem.png" alt="drem-rec" />  </a>
          </Link>
         {
           address ? (
            <>
            <div>
                <Link href={`/CreateRec`}>
                  <Button>Create REC</Button>
                </Link> &nbsp;
                <Link href={`/oppt`}>
                  <Button className="headerMenu">Opportunity</Button>
                </Link> &nbsp;
                <Link href={`/review`}>
                  <Button className="headerMenu">Sign/Review</Button>
                </Link> &nbsp;
                <Link href={`/contract`}>
                  <Button className="headerMenu">Contract</Button>
                </Link> &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;
                <Button onClick={disconnect}> 
                        {"Disconnect " + address.substr(0, 3) + "..." + address.slice(address.length - 3)}
                </Button>
            </div>
            <div>
                {/* <AlgoAddress address={address}/> */}
            </div>
            </>
           )  :  (
             <Button onClick={authenticateWithLoading}>Connect</Button>
           )
         }   
      </div>
    </div>
  )
  
}
