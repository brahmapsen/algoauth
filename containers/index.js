// import web3 from "@containers/web3"; // Web3 provider

// // Global state provider
// export default function GlobalProvider({ children }) {
//   return <web3.Provider>{children}</web3.Provider>;
// }

// // Export individual containers
// export { web3 };


import authAlgo from "@containers/AuthAlgo"; // Web3 provider

// Global state provider
export default function GlobalProvider({ children }) {
  return <authAlgo.Provider>{children}</authAlgo.Provider>;
}

// Export individual containers
export { authAlgo };
