import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
  font-family: sans-serif;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 48px;
  color: #1a202c;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 24px;
  color: #4a5568;
`;

export default function HomePage() {
  return (
    <Container>
      <Title>Welcome to Bloom App!</Title>
      <Subtitle>Your application is running correctly.</Subtitle>
    </Container>
  );
}