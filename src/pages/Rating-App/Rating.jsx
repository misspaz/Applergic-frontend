import React, { useState } from "react";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "./styles/style.scss";
import arrow from "../../assets/left-arrow.png";
import applergic from "./assets/Logo.png";
import back from "./assets/back.png";

import ButtonGeneral from "../../Components/buttonGeneral/buttonGeneral";
import { Rating } from "primereact/rating";
import { Link } from "react-router-dom";

export default function RatingApp() {
  const [value, setValue] = useState(null);

  const goBack = () => {
    window.history.back();
  };

  return (
    <>
      <header className="header-rating">
        <Link to="/main">
          <div className="header-rating-div">
          <img className="left-arrow" src={arrow} alt="arrow icon" />
          <p className="p-volver" onClick={goBack}>Volver</p>
          </div>
        </Link>
      </header>
      <main className="main-rating">
        <img src={applergic} alt="logo-applergic" className="img-main-rating" />
        <h3 className="h3-main-rating">¡Gracias por usar Applergic!</h3>
        <h4 className="h4-main-rating">Por favor, evalua tu experiencia.</h4>
        <Rating
          value={value}
          onChange={(e) => setValue(e.value)}
          cancel={false}
        />
      </main>
      <footer className="footer-rating">
        <Link to="/main">
          <ButtonGeneral text={"Enviar sugerencias"} />
        </Link>
      </footer>
    </>
  );
}
