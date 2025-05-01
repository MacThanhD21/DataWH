"use client";

import styled from "styled-components";

const WrapperContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (min-width: 640px) {
    padding: 0 2.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 0 5rem;
  }
`;

const Wrapper = ({ children }) => {
  return (
    <WrapperContainer>
      {children}
    </WrapperContainer>
  );
};

export default Wrapper;
