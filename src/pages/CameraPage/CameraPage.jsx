import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import Quagga from '@ericblade/quagga2';
import './CameraPage.scss';

export default function CameraPage () {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const [showQRText, setShowQRText] = useState(false);
  const [showBarText, setShowBarText] = useState(false);
  const [showNFCUnavailable, setShowNFCUnavailable] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [detectedQR, setDetectedQR] = useState('');
  const [detectedBarcode, setDetectedBarcode] = useState('');
  const [showBarcodeMessage, setShowBarcodeMessage] = useState(false);
  const [isTitleVisible, setIsTitleVisible] = useState(false);

  useEffect(() => {
    const accessCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
          videoRef.current.onloadeddata = handleVideoLoad;
        }
      } catch (err) {
        console.error('Error accessing the camera:', err);
      }
    };
  
    accessCamera();
  }, []);
  
  const handleVideoLoad = () => {
    const video = videoRef.current;
  
    if (video) {
      const { videoWidth, videoHeight } = video;
      const canvas = document.createElement('canvas');
      const canvasContext = canvas.getContext('2d');
  
      canvas.width = videoWidth;
      canvas.height = videoHeight;
  
      canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight);
      
    }
  };

  const detectQR = () => {
    const video = videoRef.current;

    if (video && activeImage === 'qr') {
      const canvas = document.createElement('canvas');
      const canvasContext = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        console.log('Código QR detectado:', code.data);
        setDetectedQR(code.data);
        navigate('/ResultPage', { state: { detectedCode: code.data } });
      } else {
        setDetectedQR('');
      }
    }

    requestAnimationFrame(detectQR);
  };

  const decodeBarcode = () => {
    if (activeImage === 'bar') {
      const video = videoRef.current;
  
      if (video && video.readyState === 4) { // Comprueba si el video se ha cargado completamente
        Quagga.init({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: video,
            constraints: {
              facingMode: 'environment',
            },
          },
          decoder: {
            readers: ['upc_reader'],
          },
        }, (err) => {
          if (err) {
            console.error('Error initializing Quagga:', err);
            return;
          }
  
          Quagga.start();
          Quagga.onDetected((data) => {
            console.log('Código de barras detectado:', data.codeResult.code);
            setDetectedBarcode(data.codeResult.code);
            setShowBarcodeMessage(true);
            Quagga.stop();
            setTimeout(() => {
              setShowBarcodeMessage(false);
              setDetectedBarcode('');
            }, );
            navigate('/ResultPage', { state: { detectedCode: data.codeResult.code } });
          });
        });
      } else {
        console.log('El video no se ha cargado completamente');
      }
    }
  };

  const handleImageClick = (imageType) => {
    if (imageType === 'qr') {
      setShowQRText(true);
      setShowBarText(false);
      setShowNFCUnavailable(false);
      setActiveImage('qr');
      detectQR();
    } else if (imageType === 'bar') {
      setShowQRText(false);
      setShowBarText(true);
      setShowNFCUnavailable(false);
      setActiveImage('bar');
      decodeBarcode();
    } else if (imageType === 'nfc') {
      setShowQRText(false);
      setShowBarText(false);
      setShowNFCUnavailable(true);
      setActiveImage('nfc');
    }
  };

  useEffect(() => {
    setIsTitleVisible(activeImage !== null);
  }, [activeImage]);

  return (
    <div>
      <div className='hdr'>
       <Link to="/">
    <img
      className="logo-x-r"
      src="https://icones.pro/wp-content/uploads/2021/08/icone-x-grise.png"
      alt="logo x"
    />
  </Link>
  </div>
      <div className='page'>
        {isTitleVisible && <h2 className='t-p'>Escaneando...</h2>}
        <div>
          {showQRText && (
            <p className='text-qr'>Tan solo tienes que centrar el <strong>código QR</strong> del producto en el recuadro</p>
          )}
          {showBarText && (
            <p className='text-barras'>Tan solo tienes que centrar el <strong>código de barras</strong> del producto en el recuadro</p>
          )}
          {showNFCUnavailable && (
            <p className='text-nfc'>Esta versión no está disponible</p>
          )}
        </div>
        <div className="camera-container" style={{ position: 'relative' }}>
          {detectedQR && (
            <div className="qr-link-overlay">
              <a href={detectedQR} target="_blank" rel="noopener noreferrer">
                Enlace: {detectedQR}
              </a>
            </div>
          )}
          {showBarcodeMessage && (
            <div className="barcode-overlay">
              Código de barras: {detectedBarcode}
            </div>
          )}
          <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
          <div className='lineaMedioCamara'></div>
        </div>
        <div className='file-logs'>
          <div className='log-box'>
            <div className={`log-i-b ${activeImage === 'bar' ? 'active' : ''}`} onClick={() => handleImageClick('bar')}>
              <img className='logs' src='https://cdn-icons-png.flaticon.com/512/39/39881.png' alt='Codigo de barras'/>
            </div>
            <span className='letrasIconos'>Código de barras</span>
          </div>
          <div className='log-box'>
            <div className={`log-i-a ${activeImage === 'qr' ? 'active' : ''}`} onClick={() => handleImageClick('qr')}>
              <img className='logs' src='https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Codigo_QR.svg/1200px-Codigo_QR.svg.png' alt='Codigo QR'/>
            </div>
            <span className='letrasIconos' >Código QR</span>
          </div>
          <div className='log-box'>
            <div className={`log-i-c ${activeImage === 'nfc' ? 'active' : ''}`} onClick={() => handleImageClick('nfc')}>
              <img className='logs' src='https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/NFC_logo.svg/2000px-NFC_logo.svg.png' alt='NFC'/>
            </div>
            <span className='letrasIconos' >NFC</span>
          </div>
        </div>
      </div>
    </div>
  );
};


