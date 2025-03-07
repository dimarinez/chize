import React, { createContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currLocation, setCurrLocation] = useState(null);
  const [currPlaceId, setCurrPlaceId] = useState('');
  const [activePost, setActivePost] = useState(null);
  const [image, setImage] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [locationTypeChange, setLocationTypeChange] = useState(false);
  const [locationDescription, setLocationDescription] = useState('');

  return (
    <UserContext.Provider value={{locationTypeChange, setLocationTypeChange ,user, setUser, currLocation, setCurrLocation, currPlaceId, setCurrPlaceId, setActivePost, activePost, image, setImage, locationDescription, setLocationDescription, watchId, setWatchId }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
