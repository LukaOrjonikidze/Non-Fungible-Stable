import React, {useState, useEffect} from "react";
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import homeImage from "../../assets/home-img.png";
import Minter from "./Minter";
import Gallery from "./Gallery";
import CURRENT_USER_ID from "../index";
import { nfs } from "../../../declarations/nfs";


function App() {
  const [userOwnedGallery, setUserOwnedGallery] = useState();
  const [listingGallery, setListingGallery] = useState();
  const id = CURRENT_USER_ID;

  const getNFTs = async () => {
    const userNFTIds = await nfs.getOwnedNFTs(id);
    console.log(userNFTIds);
    setUserOwnedGallery(<Gallery title="My NFTs" ids={userNFTIds} role="collection"/>)
    const listedNFTIds = await nfs.getListedNFTs();
    setListingGallery(<Gallery title="Discover" ids={listedNFTIds} role="discover"/>)
  }

  useEffect(() => { getNFTs() }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route exact path="/" element={<img className="bottom-space" src={homeImage} />}></Route>
          <Route path="/discover" element={listingGallery}></Route>
          <Route path="/minter" element={<Minter />}></Route>
          <Route path="/collection" element={userOwnedGallery}></Route>
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
