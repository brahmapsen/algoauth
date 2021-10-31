import Head from "next/head"; // HTML Head
import Header from "./Header.js"; // Header component
import React, { useState } from "react";

export default function Layout({ children }, isProfile) {


  const head = () => (
    <div>
        <link rel="stylesheet" 
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" 
            integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" 
            crossOrigin="anonymous"  />
    </div>
  )

  return  (
    <React.Fragment>
      {head()}  
      <Header />
      <div className="container pt-5 pb-2">{children}</div>
    </React.Fragment> 
  )  
           
}

