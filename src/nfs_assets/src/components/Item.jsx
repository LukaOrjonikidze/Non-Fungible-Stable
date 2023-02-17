import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as dlukIdlFactory } from "../../../declarations/dluk";
import { Principal } from "@dfinity/principal";
import { nfs } from "../../../declarations/nfs";
import Button from "./Button";
import Loader from "./Loader";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";


function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState();
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplay, setShouldDisplay] = useState(true);

  const id = props.id;
  const localHost = "http://localhost:8080";
  const agent = new HttpAgent({host:localHost});
  agent.fetchRootKey();
  let NFTActor;

  useEffect(() => {
    loadNft();
  }, []);

    let price;

    const sellItem = async () => {
      setBlur({filter: "blur(4px)"});
      setLoaderHidden(false);
      const listingResult = await nfs.listItem(id, Number(price));
      if (listingResult == "Success"){
        const NFSId = await nfs.getNFSCanisterId();
        const transferResult = await NFTActor.transferOwnership(NFSId);
        console.log(transferResult);
        if (transferResult == "Success"){
          setLoaderHidden(true);
          setButton();
          setPriceInput();
          setOwner("NFS");
          setSellStatus("Listed");

        }
      }
    }

    const handleSell = () => {
      setPriceInput(<input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => price = e.target.value}
      />);
      setButton(<Button handleClick={sellItem} text={"Confirm"}/>);
    }

    const handleBuy = async () => {
      setLoaderHidden(false);
      const dlukActor = Actor.createActor(dlukIdlFactory, {
        agent,
        canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai")
      });
      const sellerId = await nfs.getOriginalOwner(id);
      const itemPrice = await nfs.getNFTPrice(id);
      const result = await dlukActor.transfer(sellerId, itemPrice);
      if (result == "Success"){
        const purchaseResult = await nfs.completePurchase(id, CURRENT_USER_ID, sellerId);
        setLoaderHidden(true);
        if (purchaseResult == "Success"){
          setShouldDisplay(false);
        }
      }
    }

    const loadNft = async () => {
      NFTActor = await Actor.createActor(idlFactory, {
        agent,
        canisterId: id,
    });
    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));

    setName(name);
    setOwner(owner.toText());
    setImage(image);

    if (props.role == "collection"){
      const nftIsListed = await nfs.isListed(id);
      if (nftIsListed){
        setOwner("NFS");
        setBlur({filter: "blur(4px)"});
        setSellStatus("Listed");
      } else {
        setButton(<Button handleClick={handleSell} text={"Sell"}/>);
      }
    } else if (props.role == "discover"){
      const originalOwner = await nfs.getOriginalOwner(id);
      if (originalOwner.toText() != CURRENT_USER_ID.toText()){
        setButton(<Button handleClick={handleBuy} text={"Buy"}/>);
      }
      let sellPrice = await nfs.getNFTPrice(id);
      setPriceLabel(<PriceLabel sellPrice={sellPrice.toString()}/>);
    }

  }



  return (
    <div style={{display: shouldDisplay ? "inline" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> { sellStatus }</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          <Loader hidden={loaderHidden}/>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
