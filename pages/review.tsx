import React, { useState } from 'react';
import Layout from '@components/Layout'
import Button from '@components/Button';
import { authAlgo } from "@containers/index"; // Global state
import { Scenario, scenarios, signTxnWithTestAccount } from "../scenarios";
import Modal from "@components/Modal";
import Loader from '@components/Loader';
import algosdk from "algosdk";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import {  apiSubmitTransactions } from "../helpers/api";
import {  IWalletTransaction, SignTxnParams } from "../helpers/types";

import styled from "styled-components";
import { fonts } from "../styles";

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;
const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`;
const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`;
const SModalButton = styled.button`
  margin: 1em 0;
  font-size: 18px;
  font-weight: 700;
`;
const SModalParagraph = styled.p`
  margin-top: 30px;
`;
const STable = styled(SContainer as any)`
  flex-direction: column;
  text-align: left;
`;
const SRow = styled.div`
  width: 100%;
  display: flex;
  margin: 6px 0;
`;
const SKey = styled.div`
  width: 30%;
  font-weight: 700;
`;
const SValue = styled.div`
  width: 70%;
  font-family: monospace;
`;
const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;
const STestButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 64px;
  width: 100%;
  max-width: 175px;
  margin: 12px;
`;

interface IResult {
    method: string;
    body: Array<
      Array<{
        txID: string;
        signingAddress?: string;
        signature: string;
      } | null>
    >;
}

const Review = () => {
    const [result, setResult] = useState<IResult | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(false);
    const [signedTxns, setSignedTxns] = useState(null);
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [prevState, setPrevState] = useState(null)
    const [signed, setSigned] = useState(false);
    const [signedTransactionID, setSignedTransactionID] = useState(null);
     

    const { chain, address,connector } = authAlgo.useContainer(); // Global state
    
    const handleSign = async () => {
        // toggleModal();
        // setPendingRequest(true)
        await signTxnScenario(scenarios[5].scenario )
    }

    const toggleModal = () => {
        setShowModal(!showModal);
        setPendingSubmissions([]);
    }

    const signTxnScenario = async (scenario: Scenario) => {
        if (!connector) {
          return;
        }
        try {
          const txnsToSign = await scenario(chain, address);
    
          // open modal
          toggleModal();
          // toggle pending request indicator
          setPendingRequest(true);
    
          const flatTxns = txnsToSign.reduce((acc, val) => acc.concat(val), []);
    
          const walletTxns: IWalletTransaction[] = flatTxns.map(
            ({ txn, signers, authAddr, message }) => ({
              txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64"),
              signers, // TODO: put auth addr in signers array
              authAddr,
              message,
            }),
          );
    
          // sign transaction
          const requestParams: SignTxnParams = [walletTxns];
          const request = formatJsonRpcRequest("algo_signTxn", requestParams);
          const result: Array<string | null> = await connector.sendCustomRequest(request);
    
          console.log("------------->Raw response:", result);
    
          const indexToGroup = (index: number) => {
            for (let group = 0; group < txnsToSign.length; group++) {
              const groupLength = txnsToSign[group].length;
              if (index < groupLength) {
                return [group, index];
              }
    
              index -= groupLength;
            }
    
            throw new Error(`Index too large for groups: ${index}`);
          };
    
          const signedPartialTxns: Array<Array<Uint8Array | null>> = txnsToSign.map(() => []);
          result.forEach((r, i) => {
            const [group, groupIndex] = indexToGroup(i);
            const toSign = txnsToSign[group][groupIndex];
    
            if (r == null) {
              if (toSign.signers !== undefined && toSign.signers?.length < 1) {
                signedPartialTxns[group].push(null);
                return;
              }
              throw new Error(`Transaction at index ${i}: was not signed when it should have been`);
            }
    
            if (toSign.signers !== undefined && toSign.signers?.length < 1) {
              throw new Error(`Transaction at index ${i} was signed when it should not have been`);
            }
    
            const rawSignedTxn = Buffer.from(r, "base64");
            signedPartialTxns[group].push(new Uint8Array(rawSignedTxn));
          });
    
          const signedTxns: Uint8Array[][] = signedPartialTxns.map(
            (signedPartialTxnsInternal, group) => {
              return signedPartialTxnsInternal.map((stxn, groupIndex) => {
                if (stxn) {
                  return stxn;
                }
    
                return signTxnWithTestAccount(txnsToSign[group][groupIndex].txn);
              });
            },
          );
    
          const signedTxnInfo: Array<Array<{
            txID: string;
            signingAddress?: string;
            signature: string;
          } | null>> = signedPartialTxns.map((signedPartialTxnsInternal, group) => {
            return signedPartialTxnsInternal.map((rawSignedTxn, i) => {
              if (rawSignedTxn == null) {
                return null;
              }
    
              const signedTxn = algosdk.decodeSignedTransaction(rawSignedTxn);
              const txn = (signedTxn.txn as unknown) as algosdk.Transaction;
              const txID = txn.txID();
              const unsignedTxID = txnsToSign[group][i].txn.txID();
    
              if (txID !== unsignedTxID) {
                throw new Error(
                  `Signed transaction at index ${i} differs from unsigned transaction. Got ${txID}, expected ${unsignedTxID}`,
                );
              }
    
              if (!signedTxn.sig) {
                throw new Error(`Signature not present on transaction at index ${i}`);
              }
    
              return {
                txID,
                signingAddress: signedTxn.sgnr ? algosdk.encodeAddress(signedTxn.sgnr) : undefined,
                signature: Buffer.from(signedTxn.sig).toString("base64"),
              };
            });
          });
    
          console.log("---------->Signed txn info:", signedTxnInfo);
          
    
          // format displayed result
          const formattedResult: IResult = {
            method: "algo_signTxn",
            body: signedTxnInfo,
          };
    
          // display result
          setResult(formattedResult);
          setPendingRequest(false);
          setSignedTxns(signedTxns);

          //setSignedTransactionID(formattedResult);
    
        } catch (error) {
          console.error(error);
          setPendingRequest(false);
          setResult(null);
        }
      };

    const submitSignedTransaction = () => {
        if (signedTxns == null) {
          throw new Error("Transactions to submit are null");
        }

        setPendingSubmissions(signedTxns.map(() => 0));
        //this.setState({ pendingSubmissions: signedTxns.map(() => 0) });
    
        signedTxns.forEach(async (signedTxn, index) => {
          try {
            const confirmedRound = await apiSubmitTransactions(chain, signedTxn);
            
            // setPrevState(prevState => {
            //   return {
            //     pendingSubmissions: prevState.pendingSubmissions.map((v, i) => {
            //       if (index === i) {
            //         return confirmedRound;
            //       }
            //       return v;
            //     }),
            //   };
            // });
    
            console.log(`Transaction confirmed at round ${confirmedRound}`);
          } catch (err) {
            // setPrevState(prevState => {
            //   return {
            //     pendingSubmissions: prevState.pendingSubmissions.map((v, i) => {
            //       if (index === i) {
            //         return err;
            //       }
            //       return v;
            //     }),
            //   };
            // });
    
            console.error(`Error submitting transaction at index ${index}:`, err);
          }
        });
        

    }


    return (
        <Layout>
            <div>
                <h2> Review an Asset</h2>
                <Button onClick={handleSign}> Sign </Button>
                {  signedTransactionID && 
                  <div className="alert alert-success">User signed in the Application{signedTransactionID}</div>}

                <Modal show={showModal} toggleModal={toggleModal}>
                    {pendingRequest ? (
                        <SModalContainer>
                        <SModalTitle>{"Pending Call Request"}</SModalTitle>
                        <SContainer>
                            <Loader />
                            <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
                        </SContainer>
                        </SModalContainer>
                    ) : result ? (
                        <SModalContainer>
                            <SModalTitle>{"Call Request Approved"}</SModalTitle>
                            <STable>
                                <SRow>
                                <SKey>Method</SKey>
                                <SValue>{result.method}</SValue>
                                </SRow>
                                {result.body.map((signedTxns, index) => (
                                <SRow key={index}>
                                    <SKey>{`Atomic group ${index}`}</SKey>
                                    <SValue>
                                    {signedTxns.map((txn, txnIndex) => (
                                        <div key={txnIndex}>
                                        {!!txn?.txID && <p>TxID: {txn.txID}</p>}
                                        {!!txn?.signature && <p>Sig: {txn.signature}</p>}
                                        {!!txn?.signingAddress && <p>AuthAddr: {txn.signingAddress}</p>}
                                        </div>
                                    ))}
                                    </SValue>
                                </SRow>
                                ))}
                            </STable>
                            <SModalButton onClick={() => submitSignedTransaction()}
                                disabled={pendingSubmissions.length !== 0}>   
                                {"Submit transaction to network."}
                            </SModalButton>
                            {pendingSubmissions.map((submissionInfo, index) => {
                                const key = `${index}:${
                                typeof submissionInfo === "number" ? submissionInfo : "err"
                                }`;
                                const prefix = `Txn Group ${index}: `;
                                let content: string;

                                if (submissionInfo === 0) {
                                    content = "Submitting...";
                                } else if (typeof submissionInfo === "number") {
                                    content = `Confirmed at round ${submissionInfo}`;
                                } else {
                                    content = "Rejected by network. See console for more information.";
                                }
                                return <SModalTitle key={key}>{prefix + content}</SModalTitle>;
                            })}
                        </SModalContainer>
                    ) : (
                            <SModalContainer>
                                <SModalTitle>{"Call Request Rejected"}</SModalTitle>
                            </SModalContainer>
                        )}
            </Modal>

            </div>
        </Layout>
    )
}

export default Review;