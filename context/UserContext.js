import React, { createContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currLocation, setCurrLocation] = useState(null);
  const [currPlaceId, setCurrPlaceId] = useState('');
  const [activePost, setActivePost] = useState(null);
  const [image, setImage] = useState(null);
  const [locationDescription, setLocationDescription] = useState('');
  const [pushNoticationToken, setPushNotificationToken] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser, currLocation, setCurrLocation, currPlaceId, setCurrPlaceId, setActivePost, activePost, pushNoticationToken, setPushNotificationToken, image, setImage, locationDescription, setLocationDescription }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
