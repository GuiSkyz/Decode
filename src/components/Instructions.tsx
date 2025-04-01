import React from 'react';
import { Box, Text, UnorderedList, ListItem } from '@chakra-ui/react';

function Instructions() {
  return (
    <Box p={4} bg="brand.accent" borderRadius="lg" w="100%">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Como Jogar:
      </Text>
      <UnorderedList spacing={2}>
        <ListItem>O jogo é jogado em duplas</ListItem>
        <ListItem>Cada dupla tem 2 minutos por rodada</ListItem>
        <ListItem>Um jogador deve fazer sua dupla adivinhar a palavra sem dizê-la</ListItem>
        <ListItem>Pode usar gestos, sinônimos e explicações</ListItem>
        <ListItem>Não é permitido usar palavras da mesma família</ListItem>
        <ListItem>Ganha a dupla que acertar mais palavras</ListItem>
      </UnorderedList>
    </Box>
  );
}

export default Instructions; 