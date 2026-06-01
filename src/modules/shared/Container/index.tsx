import React from 'react';
import { useDeviceType } from '../../../core/hooks/useDeviceType';
import { useAuth } from '../../../core/context/AuthContext';

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
}

const Container: React.FC<ContainerProps> = ({ children, maxWidth = '100%' }) => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const { isAuthenticated } = useAuth();

  maxWidth = isAuthenticated ? '80%' : '100%';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: isMobile ? '98%' : maxWidth,
        margin: '0 auto',
        padding: isMobile ? '0 3px' : '0 0px',
      }}>
      {children}
    </div>
  );
};

export default Container;
