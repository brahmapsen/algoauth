import '../styles/globals.css'
import GlobalProvider from "@containers/index";

// function SafeHydrate({ children }) {
//   return (
//     <div suppressHydrationWarning>
//       {typeof window === 'undefined' ? null : children}
//     </div>
//   )
// }

function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalProvider>
          <Component {...pageProps} />
      </GlobalProvider>
    </>
  )
}

export default MyApp;
