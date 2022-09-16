import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import { AlgoliaProvider, SearchControl } from 'leaflet-geosearch';
import "./app.css"
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect, useRef, useState } from 'react';

interface IPosition {
  lat: number;
  lng: number;
}

function App() {
  const [position, setPosition] = useState<IPosition | null>(null);
  
  return (
    <div className="app">
      
      <div className="container">

      <p>
        latitude: {position?.lat} <br />
        longitude: {position?.lng} <br />
      </p>

      <MapContainer 
        center={position ? position : [-23.607246, -46.696824]} 
        zoom={14} 
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker position={position ?? { lat: -23.607246, lng:  -46.696824}} setPosition={setPosition} />
      </MapContainer>

      </div>

      
    </div>
  )
}

export default App


interface IProps {
  position: IPosition;
  setPosition: (position: IPosition) => void;
}



function LocationMarker({ position, setPosition }: IProps) {
  const markerRef = useRef<any>(null)

  const map = useMapEvents({
    click: (e) => {
      setPosition(e.latlng)
    },
  })
  
  map.on('geosearch/showlocation', (e) => {
    console.log("e", e.location);

    // @ts-ignore
    setPosition({ lat: e.location.y, lng: e.location.x })
  });

  // @ts-ignore
  useEffect(() => {
    const searchControl = SearchControl({
      style: 'bar',
      showMarker: false,
      showPopup: false,
      notFoundMessage: 'Local não encontrado, tente novamente.',
      provider: new AlgoliaProvider(),
    });

    map.addControl(searchControl);

    return () => map.removeControl(searchControl);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (response) => {
        setPosition({ lng: response.coords.longitude, lat: response.coords.latitude })
        map.flyTo({ lng: response.coords.longitude, lat: response.coords.latitude  })
      },
      (err) => alert(err.message),
      { timeout: 15000, enableHighAccuracy: true }
    )
  }, [navigator.geolocation])

  function dragend() {
    if (markerRef.current) {
      const currPosition = markerRef.current.getLatLng() ;

      setPosition(currPosition)
    }
  }

  return (
    <Marker
      position={position} 
      draggable 
      eventHandlers={{ dragend }}
      ref={markerRef}
    >
      <Popup>You are here</Popup>
    </Marker>
  )
}