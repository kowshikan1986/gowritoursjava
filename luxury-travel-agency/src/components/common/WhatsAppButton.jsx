import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Container = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Button = styled(motion.button)`
  background-color: #25D366;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
  z-index: 1002;

  &:hover {
    background-color: #20BA56;
  }
`;

const Widget = styled(motion.div)`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1001;
  transform-origin: bottom right;

  @media (max-width: 400px) {
    width: 300px;
  }
`;

const WidgetHeader = styled.div`
  background-color: #25D366;
  padding: 2rem 1.5rem;
  color: white;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
  padding: 0;
  line-height: 1;

  &:hover {
    opacity: 1;
  }
`;

const HeaderTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const HeaderSubtitle = styled.p`
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const WidgetBody = styled.div`
  padding: 1.5rem;
  background: white;
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: #f0fdf4;
    border-color: #25D366;
    transform: translateY(-2px);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #7c3aed;
  font-size: 1.5rem;
  border: 2px solid #f0f0f0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const WhatsAppBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  color: white;
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactLabel = styled.span`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 2px;
`;

const ContactName = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
`;

const WhatsAppIcon = () => (
  <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382C17.112 14.011 15.32 13.098 14.987 12.977C14.654 12.856 14.412 12.795 14.17 13.159C13.928 13.523 13.232 14.372 13.02 14.614C12.808 14.857 12.596 14.887 12.233 14.705C11.87 14.523 10.699 14.132 9.31105 12.885C8.21905 11.903 7.48205 10.69 7.27005 10.327C7.05805 9.963 7.24805 9.765 7.43005 9.584C7.59305 9.422 7.79305 9.16 7.97505 8.948C8.15705 8.736 8.21705 8.584 8.33805 8.342C8.45905 8.1 8.39805 7.888 8.30705 7.706C8.21605 7.524 7.48905 5.706 7.18605 4.978C6.89005 4.269 6.59105 4.366 6.36805 4.366C6.16205 4.366 5.92005 4.366 5.67805 4.366C5.43605 4.366 5.04205 4.457 4.70905 4.82C4.37605 5.184 3.43805 6.063 3.43805 7.851C3.43805 9.639 4.73905 11.367 4.92105 11.609C5.10305 11.851 7.50805 15.603 11.234 17.204C14.077 18.426 14.661 18.199 15.266 18.139C15.871 18.078 17.229 17.351 17.502 16.563C17.775 15.775 17.775 15.109 17.714 15.018C17.654 14.927 17.472 14.867 17.109 14.685H17.472ZM12.005 21.625C10.222 21.625 8.55805 21.159 7.09805 20.334L6.77205 20.141L3.03705 21.121L4.04805 17.558L3.83405 17.218C2.90605 15.733 2.41705 14.015 2.41705 12.242C2.41705 6.958 6.71705 2.658 12.005 2.658C14.564 2.658 16.969 3.655 18.779 5.465C20.589 7.275 21.586 9.68 21.586 12.239C21.586 17.523 17.286 21.823 11.998 21.823L12.005 21.625Z" />
  </svg>
);

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container>
      <AnimatePresence>
        {isOpen && (
          <Widget
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <WidgetHeader>
              <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
              <HeaderTitle>Hello!</HeaderTitle>
              <HeaderSubtitle>
                Click one of our contacts below to chat on WhatsApp
              </HeaderSubtitle>
            </WidgetHeader>
            <WidgetBody>
              <ContactItem 
                href="https://wa.me/447956375803" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <AvatarContainer>
                  <Avatar>G</Avatar>
                  <WhatsAppBadge>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382C17.112 14.011 15.32 13.098 14.987 12.977C14.654 12.856 14.412 12.795 14.17 13.159C13.928 13.523 13.232 14.372 13.02 14.614C12.808 14.857 12.596 14.887 12.233 14.705C11.87 14.523 10.699 14.132 9.31105 12.885C8.21905 11.903 7.48205 10.69 7.27005 10.327C7.05805 9.963 7.24805 9.765 7.43005 9.584C7.59305 9.422 7.79305 9.16 7.97505 8.948C8.15705 8.736 8.21705 8.584 8.33805 8.342C8.45905 8.1 8.39805 7.888 8.30705 7.706C8.21605 7.524 7.48905 5.706 7.18605 4.978C6.89005 4.269 6.59105 4.366 6.36805 4.366C6.16205 4.366 5.92005 4.366 5.67805 4.366C5.43605 4.366 5.04205 4.457 4.70905 4.82C4.37605 5.184 3.43805 6.063 3.43805 7.851C3.43805 9.639 4.73905 11.367 4.92105 11.609C5.10305 11.851 7.50805 15.603 11.234 17.204C14.077 18.426 14.661 18.199 15.266 18.139C15.871 18.078 17.229 17.351 17.502 16.563C17.775 15.775 17.775 15.109 17.714 15.018C17.654 14.927 17.472 14.867 17.109 14.685H17.472ZM12.005 21.625C10.222 21.625 8.55805 21.159 7.09805 20.334L6.77205 20.141L3.03705 21.121L4.04805 17.558L3.83405 17.218C2.90605 15.733 2.41705 14.015 2.41705 12.242C2.41705 6.958 6.71705 2.658 12.005 2.658C14.564 2.658 16.969 3.655 18.779 5.465C20.589 7.275 21.586 9.68 21.586 12.239C21.586 17.523 17.286 21.823 11.998 21.823L12.005 21.625Z" />
                    </svg>
                  </WhatsAppBadge>
                </AvatarContainer>
                <ContactInfo>
                  <ContactLabel>Support</ContactLabel>
                  <ContactName>Gowri Tours</ContactName>
                </ContactInfo>
              </ContactItem>
            </WidgetBody>
          </Widget>
        )}
      </AnimatePresence>
      
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <WhatsAppIcon />
      </Button>
    </Container>
  );
};

export default WhatsAppButton;
