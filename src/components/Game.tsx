import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Container,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  Icon,
  Image,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import Instructions from './Instructions';

const GAME_TIME = 120; // 2 minutos em segundos
const ALL_WORDS = [
  // Conceitos Básicos
  'Empreender', 'Negócio', 'Empresa', 'Liderança', 'Objetivo',
  'Sucesso', 'Crescimento', 'Iniciativa', 'Autonomia', 'Desafio',

  // Finanças
  'Dinheiro', 'Lucro', 'Investidor', 'Preço', 'Orçamento',
  'Custo', 'Capital', 'Receita', 'Rentável', 'Economia',

  // Gestão
  'Meta', 'Resultados', 'Organização', 'Equipe', 'Projeto',
  'Estratégia', 'Planejamento', 'Controle', 'Execução', 'Tomada de decisão',

  // Marketing e Vendas
  'Marca', 'Cliente', 'Promoção', 'Divulgação', 'Propaganda',
  'Atratividade', 'Persuasão', 'Destaque', 'Mercado', 'Concorrência',

  // Metodologias
  'Aprendizado', 'Experiência', 'Testes', 'Eficiência', 'Produtividade',
  'Simplificação', 'Criatividade', 'Desenvolvimento', 'Solução', 'Dinamismo',

  // Ecossistema
  'Parceria', 'Mentoria', 'Networking', 'Oportunidade', 'Conexão',
  'Relacionamento', 'Colaboração', 'Suporte', 'Comunidade', 'Referência',

  // Inovação
  'Tecnologia', 'Tendência', 'Digitalização', 'Automação', 'Transformação',
  'Originalidade', 'Descoberta', 'Adaptação', 'Progresso', 'Mudança',

  // Soft Skills
  'Persistência', 'Determinação', 'Autoconfiança', 'Foco', 'Resiliência',
  'Paciência', 'Motivação', 'Curiosidade', 'Flexibilidade', 'Empatia',

  // Documentação
  'Contrato', 'Planejamento', 'Proposta', 'Apresentação', 'Relatório',
  'Registro', 'Visão', 'Missão', 'Formalização', 'Análise'
];


interface Team {
  name: string;
  score: number;
  players: string[];
  usedWords: string[];
  availableWords: string[];
}

function Game(): JSX.Element {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<number>(1);
  const [teams, setTeams] = useState<Team[]>([
    { name: 'Time 1', score: 0, players: ['', ''], usedWords: [], availableWords: [] },
    { name: 'Time 2', score: 0, players: ['', ''], usedWords: [], availableWords: [] },
  ]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [showWords, setShowWords] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [winner, setWinner] = useState<Team | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(true);
  const toast = useToast();

  const shuffleAndSplitWords = () => {
    const shuffledWords = [...ALL_WORDS].sort(() => Math.random() - 0.5);
    const halfLength = 10; // Cada time recebe 10 palavras
    
    const team1Words = shuffledWords.slice(0, halfLength);
    const team2Words = shuffledWords.slice(halfLength, halfLength * 2);

    const newTeams = teams.map((team, index) => ({
      ...team,
      score: 0,
      usedWords: [],
      availableWords: index === 0 ? team1Words : team2Words
    }));

    setTeams(newTeams);
  };

  const endTurn = () => {
    setGameStarted(false);
    setTimeLeft(GAME_TIME);
    setShowWords(false);
    setCurrentTeam(currentTeam === 1 ? 2 : 1);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime: number) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endTurn();
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, endTurn]);

  const resetGame = () => {
    shuffleAndSplitWords();
    setGameStarted(false);
    setTimeLeft(GAME_TIME);
    setShowWords(false);
    setCurrentTeam(1);
    setShowVictoryModal(false);
    setWinner(null);
  };

  const startGame = () => {
    if (teams[0].availableWords.length === 0 || teams[1].availableWords.length === 0) {
      shuffleAndSplitWords();
    }
    setGameStarted(true);
    setShowWords(true);
  };

  const handleCorrectWord = (word: string) => {
    const teamIndex = currentTeam - 1;
    const newTeams = [...teams];
    
    if (newTeams[teamIndex].usedWords.includes(word)) {
      toast({
        title: "Palavra já utilizada",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    newTeams[teamIndex] = {
      ...newTeams[teamIndex],
      score: newTeams[teamIndex].score + 1,
      usedWords: [...newTeams[teamIndex].usedWords, word]
    };
    setTeams(newTeams);

    if (newTeams[teamIndex].usedWords.length === newTeams[teamIndex].availableWords.length) {
      setWinner(newTeams[teamIndex]);
      setShowVictoryModal(true);
      setGameStarted(false);
    }
  };

  const handleSetupTeams = () => {
    setShowSetupModal(false);
    resetGame();
  };

  const updateTeamName = (teamIndex: number, name: string) => {
    const newTeams = [...teams];
    newTeams[teamIndex] = {
      ...newTeams[teamIndex],
      name: name || `Time ${teamIndex + 1}`
    };
    setTeams(newTeams);
  };

  const updatePlayerName = (teamIndex: number, playerIndex: number, name: string) => {
    const newTeams = [...teams];
    const newPlayers = [...newTeams[teamIndex].players];
    newPlayers[playerIndex] = name;
    newTeams[teamIndex] = {
      ...newTeams[teamIndex],
      players: newPlayers
    };
    setTeams(newTeams);
  };

  return (
    <Box bg="#131925" minH="100vh" py={8}>
      <Container maxW="container.md">
        <VStack spacing={6}>
          <Box textAlign="center" mb={6}>
            <Image 
              src="/decode-logo.png" 
              alt="Decode Logo"
              width="200px"
              height="auto"
              mx="auto"
              mb={4}
            />
            <Heading color="#FDFDFE">Jogo de Palavras</Heading>
          </Box>
          
          {!gameStarted && !showVictoryModal && <Instructions />}
          
          <Box w="100%" p={6} bg="rgba(30, 208, 244, 0.1)" borderRadius="lg" borderWidth="1px" borderColor="#1ED0F4">
            <VStack spacing={4}>
              <Text fontSize="xl" color="#FDFDFE">
                Tempo Restante: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </Text>
              
              <HStack spacing={4}>
                {teams.map((team: Team, index: number) => (
                  <Badge
                    key={team.name}
                    bg={currentTeam === index + 1 ? '#1ED0F4' : 'rgba(30, 208, 244, 0.1)'}
                    color="#FDFDFE"
                    p={2}
                    borderRadius="md"
                  >
                    {team.name}: {team.score} pontos
                    {team.players[0] && team.players[1] && 
                      ` (${team.players[0]} e ${team.players[1]})`
                    }
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </Box>

          {!gameStarted && !showVictoryModal ? (
            <Button
              bg="#1ED0F4"
              color="#131925"
              size="lg"
              onClick={startGame}
              _hover={{ bg: 'rgba(30, 208, 244, 0.8)' }}
            >
              Iniciar Rodada
            </Button>
          ) : !showVictoryModal && (
            <VStack spacing={4} w="100%">
              {showWords && (
                <Box w="100%" p={4} bg="rgba(30, 208, 244, 0.05)" borderRadius="md" boxShadow="sm">
                  <VStack spacing={2}>
                    {teams[currentTeam - 1].availableWords.map((word) => {
                      const isUsed = teams[currentTeam - 1].usedWords.includes(word);
                      return (
                        <Button
                          key={word}
                          w="100%"
                          variant="outline"
                          isDisabled={isUsed}
                          bg={isUsed ? 'rgba(30, 208, 244, 0.2)' : 'transparent'}
                          color={isUsed ? '#1ED0F4' : '#FDFDFE'}
                          borderColor={isUsed ? '#1ED0F4' : 'rgba(253, 253, 254, 0.2)'}
                          _hover={{
                            bg: isUsed ? 'rgba(30, 208, 244, 0.2)' : 'rgba(30, 208, 244, 0.1)',
                            borderColor: '#1ED0F4',
                          }}
                          onClick={() => handleCorrectWord(word)}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text>{word}</Text>
                          {isUsed && (
                            <Icon
                              as={CheckIcon}
                              color="#1ED0F4"
                              boxSize={5}
                              ml={2}
                            />
                          )}
                        </Button>
                      );
                    })}
                  </VStack>
                </Box>
              )}
              
              <Button
                bg="#1ED0F4"
                color="#131925"
                onClick={endTurn}
                _hover={{ bg: 'rgba(30, 208, 244, 0.8)' }}
              >
                Encerrar Turno
              </Button>
            </VStack>
          )}

          <Modal isOpen={showSetupModal} onClose={() => {}} isCentered>
            <ModalOverlay />
            <ModalContent bg="#131925" p={4}>
              <ModalHeader textAlign="center" color="#FDFDFE">
                Configurar Times
              </ModalHeader>
              <ModalBody>
                <VStack spacing={4}>
                  {teams.map((team, teamIndex) => (
                    <Box key={teamIndex} w="100%">
                      <FormControl>
                        <FormLabel color="#FDFDFE">Nome do Time {teamIndex + 1}</FormLabel>
                        <Input
                          placeholder={`Time ${teamIndex + 1}`}
                          value={team.name}
                          onChange={(e) => updateTeamName(teamIndex, e.target.value)}
                          bg="rgba(30, 208, 244, 0.1)"
                          color="#FDFDFE"
                          borderColor="#1ED0F4"
                          _hover={{ borderColor: 'rgba(30, 208, 244, 0.8)' }}
                          _focus={{ borderColor: '#1ED0F4', boxShadow: '0 0 0 1px #1ED0F4' }}
                        />
                      </FormControl>
                      <HStack mt={2}>
                        <FormControl>
                          <FormLabel color="#FDFDFE">Jogador 1</FormLabel>
                          <Input
                            placeholder="Nome do jogador 1"
                            value={team.players[0]}
                            onChange={(e) => updatePlayerName(teamIndex, 0, e.target.value)}
                            bg="rgba(30, 208, 244, 0.1)"
                            color="#FDFDFE"
                            borderColor="#1ED0F4"
                            _hover={{ borderColor: 'rgba(30, 208, 244, 0.8)' }}
                            _focus={{ borderColor: '#1ED0F4', boxShadow: '0 0 0 1px #1ED0F4' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel color="#FDFDFE">Jogador 2</FormLabel>
                          <Input
                            placeholder="Nome do jogador 2"
                            value={team.players[1]}
                            onChange={(e) => updatePlayerName(teamIndex, 1, e.target.value)}
                            bg="rgba(30, 208, 244, 0.1)"
                            color="#FDFDFE"
                            borderColor="#1ED0F4"
                            _hover={{ borderColor: 'rgba(30, 208, 244, 0.8)' }}
                            _focus={{ borderColor: '#1ED0F4', boxShadow: '0 0 0 1px #1ED0F4' }}
                          />
                        </FormControl>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button 
                  bg="#1ED0F4"
                  color="#131925"
                  onClick={handleSetupTeams}
                  _hover={{ bg: 'rgba(30, 208, 244, 0.8)' }}
                >
                  Começar Jogo
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal isOpen={showVictoryModal} onClose={() => {}} isCentered>
            <ModalOverlay />
            <ModalContent bg="#131925">
              <ModalHeader textAlign="center" color="#1ED0F4">
                🎉 Parabéns! 🎉
              </ModalHeader>
              <ModalBody>
                <Text fontSize="xl" textAlign="center" color="#FDFDFE">
                  {winner?.name} venceu o jogo com {winner?.score} pontos!
                  {winner?.players[0] && winner?.players[1] && (
                    <Text mt={2} fontSize="lg" color="#FDFDFE">
                      Parabéns {winner.players[0]} e {winner.players[1]}!
                    </Text>
                  )}
                </Text>
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button 
                  bg="#1ED0F4"
                  color="#131925"
                  onClick={resetGame}
                  _hover={{ bg: 'rgba(30, 208, 244, 0.8)' }}
                >
                  Jogar Novamente
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
}

export default Game; 