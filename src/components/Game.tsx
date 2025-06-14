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
  Progress,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import Instructions from './Instructions';
import StatsDisplay from './StatsDisplay';
import { useGameStats } from '../hooks/useGameStats';

const GAME_TIME = 120; // 2 minutos em segundos
const TOTAL_ROUNDS = 3; // 3 rodadas por partida
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
  roundScores: number[]; // Pontuação por rodada
  matchScore: number; // Pontuação total da partida
}

function Game(): JSX.Element {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<number>(1);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [teams, setTeams] = useState<Team[]>([
    { 
      name: 'Time 1', 
      score: 0, 
      players: ['', ''], 
      usedWords: [], 
      availableWords: [],
      roundScores: [],
      matchScore: 0
    },
    { 
      name: 'Time 2', 
      score: 0, 
      players: ['', ''], 
      usedWords: [], 
      availableWords: [],
      roundScores: [],
      matchScore: 0
    },
  ]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [showWords, setShowWords] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showMatchEndModal, setShowMatchEndModal] = useState(false);
  const [winner, setWinner] = useState<Team | null>(null);
  const [matchWinner, setMatchWinner] = useState<Team | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(true);
  const { stats, recordMatchResult, getTeamWins, resetStats } = useGameStats();
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
    
    // Se ambos os times jogaram nesta rodada, avançar para próxima rodada
    if (currentTeam === 2) {
      endRound();
    } else {
      setCurrentTeam(currentTeam + 1);
    }
  };

  const endRound = () => {
    // Salvar pontuação da rodada para cada time
    const updatedTeams = teams.map(team => ({
      ...team,
      roundScores: [...team.roundScores, team.score],
      matchScore: team.matchScore + team.score,
      score: 0, // Reset da pontuação da rodada
      usedWords: [], // Reset das palavras usadas para próxima rodada
    }));
    
    setTeams(updatedTeams);
    setCurrentTeam(1);
    
    if (currentRound >= TOTAL_ROUNDS) {
      // Fim da partida
      endMatch(updatedTeams);
    } else {
      // Próxima rodada
      setCurrentRound(currentRound + 1);
      shuffleAndSplitWords(); // Novas palavras para próxima rodada
      toast({
        title: `Rodada ${currentRound} finalizada!`,
        description: `Iniciando rodada ${currentRound + 1}`,
        status: "info",
        duration: 3000,
      });
    }
  };

  const endMatch = (finalTeams: Team[]) => {
    // Determinar vencedor da partida
    const sortedTeams = [...finalTeams].sort((a, b) => b.matchScore - a.matchScore);
    const winner = sortedTeams[0];
    
    setMatchWinner(winner);
    setShowMatchEndModal(true);
    
    // Registrar resultado da partida
    recordMatchResult({
      teams: finalTeams.map(team => ({
        name: team.name,
        finalScore: team.matchScore,
        players: team.players,
        roundScores: team.roundScores
      })),
      winner: winner.name || `Time ${teams.findIndex(t => t === winner) + 1}`,
      rounds: TOTAL_ROUNDS
    });
    
    toast({
      title: "🎉 Partida Finalizada!",
      description: `${winner.name} venceu a partida!`,
      status: "success",
      duration: 5000,
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime: number) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameStarted) {
      endTurn();
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, currentTeam, currentRound]);

  const resetGame = () => {
    setCurrentRound(1);
    setTeams(prevTeams => prevTeams.map(team => ({
      ...team,
      score: 0,
      matchScore: 0,
      roundScores: [],
      usedWords: [],
      availableWords: []
    })));
    shuffleAndSplitWords();
    setGameStarted(false);
    setTimeLeft(GAME_TIME);
    setShowWords(false);
    setCurrentTeam(1);
    setShowVictoryModal(false);
    setShowMatchEndModal(false);
    setWinner(null);
    setMatchWinner(null);
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

    // Verificar se o time acertou todas as palavras da rodada
    if (newTeams[teamIndex].usedWords.length === newTeams[teamIndex].availableWords.length) {
      setWinner(newTeams[teamIndex]);
      setShowVictoryModal(true);
      setGameStarted(false);
      
      toast({
        title: "🎉 Rodada Completa!",
        description: `${newTeams[teamIndex].name} acertou todas as palavras!`,
        status: "success",
        duration: 3000,
      });
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
      name: name.trim() // Remove apenas espaços extras, permite string vazia
    };
    setTeams(newTeams);
  };

  // Função helper para exibir o nome do time com fallback
  const getDisplayTeamName = (team: Team | null, teamIndex: number) => {
    if (!team) return `Time ${teamIndex + 1}`;
    return team.name || `Time ${teamIndex + 1}`;
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
            <HStack justify="center" mt={4} spacing={4}>
              <StatsDisplay stats={stats} onResetStats={resetStats} />
            </HStack>
          </Box>
          
          {!gameStarted && !showVictoryModal && <Instructions />}
          
          <Box w="100%" p={6} bg="rgba(30, 208, 244, 0.1)" borderRadius="lg" borderWidth="1px" borderColor="#1ED0F4">
            <VStack spacing={4}>
              {/* Informações da Rodada */}
              <VStack spacing={2}>
                <Text fontSize="xl" color="#1ED0F4" fontWeight="bold">
                  Rodada {currentRound} de {TOTAL_ROUNDS}
                </Text>
                <Progress 
                  value={(currentRound / TOTAL_ROUNDS) * 100} 
                  colorScheme="cyan" 
                  size="sm" 
                  w="200px"
                  bg="rgba(30, 208, 244, 0.2)"
                />
              </VStack>
              
              <Text fontSize="xl" color="#FDFDFE">
                Tempo Restante: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </Text>
              
              {/* Pontuação Atual da Rodada */}
              <HStack spacing={4}>
                {teams.map((team: Team, index: number) => (
                  <VStack key={index} spacing={1}>
                    <Badge
                      bg={currentTeam === index + 1 ? '#1ED0F4' : 'rgba(30, 208, 244, 0.1)'}
                      color="#FDFDFE"
                      p={2}
                      borderRadius="md"
                      fontSize="sm"
                    >
                      {getDisplayTeamName(team, index)}: {team.score} pts (rodada)
                      {team.players[0] && team.players[1] && 
                        ` (${team.players[0]} e ${team.players[1]})`
                      }
                    </Badge>
                    
                    {/* Pontuação Total da Partida */}
                    <Text fontSize="xs" color="#1ED0F4">
                      Total: {team.matchScore} pts | Vitórias: {getTeamWins(getDisplayTeamName(team, index))}
                    </Text>
                    
                    {/* Histórico de Rodadas */}
                    {team.roundScores.length > 0 && (
                      <HStack spacing={1}>
                        {team.roundScores.map((score, roundIndex) => (
                          <Badge key={roundIndex} size="xs" bg="rgba(30, 208, 244, 0.3)" color="#FDFDFE">
                            R{roundIndex + 1}: {score}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </VStack>
                ))}
              </HStack>
            </VStack>
          </Box>

          {!gameStarted && !showVictoryModal && !showMatchEndModal ? (
            <Button
              bg="#1ED0F4"
              color="#131925"
              size="lg"
              onClick={startGame}
              _hover={{ bg: 'rgba(30, 208, 244, 0.8)' }}
            >
              {currentRound === 1 ? 'Iniciar Partida' : `Iniciar Rodada ${currentRound}`}
            </Button>
          ) : !showVictoryModal && !showMatchEndModal && (
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
                🎉 Rodada Finalizada! 🎉
              </ModalHeader>
              <ModalBody>
                <VStack spacing={4}>
                  <Text fontSize="xl" textAlign="center" color="#FDFDFE">
                    {winner ? getDisplayTeamName(winner, teams.findIndex(t => t === winner)) : 'Um time'} completou todas as palavras da rodada!
                  </Text>
                  {winner?.players[0] && winner?.players[1] && (
                    <Text fontSize="lg" color="#FDFDFE" textAlign="center">
                      Parabéns {winner.players[0]} e {winner.players[1]}!
                    </Text>
                  )}
                  <Text fontSize="md" color="#1ED0F4" textAlign="center">
                    Pontuação da rodada: {winner?.score} pontos
                  </Text>
                </VStack>
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button 
                  bg="#1ED0F4"
                  color="#131925"
                  onClick={() => {
                    setShowVictoryModal(false);
                    endTurn();
                  }}
                  _hover={{ bg: 'rgba(30, 208, 244, 0.8)' }}
                >
                  {currentRound >= TOTAL_ROUNDS && currentTeam === 2 ? 'Finalizar Partida' : 'Próximo Turno'}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal isOpen={showMatchEndModal} onClose={() => {}} isCentered size="lg">
            <ModalOverlay />
            <ModalContent bg="#131925">
              <ModalHeader textAlign="center" color="#1ED0F4">
                🏆 PARTIDA FINALIZADA! 🏆
              </ModalHeader>
              <ModalBody>
                <VStack spacing={6}>
                  <Text fontSize="2xl" textAlign="center" color="#FDFDFE" fontWeight="bold">
                    {matchWinner ? getDisplayTeamName(matchWinner, teams.findIndex(t => t === matchWinner)) : 'Um time'} VENCEU A PARTIDA!
                  </Text>
                  
                  {matchWinner?.players[0] && matchWinner?.players[1] && (
                    <Text fontSize="lg" color="#1ED0F4" textAlign="center">
                      🎉 {matchWinner.players[0]} e {matchWinner.players[1]} 🎉
                    </Text>
                  )}

                  {/* Placar Final */}
                  <Box w="100%" p={4} bg="rgba(30, 208, 244, 0.1)" borderRadius="lg">
                    <Text fontSize="lg" fontWeight="bold" mb={3} color="#1ED0F4" textAlign="center">
                      Placar Final
                    </Text>
                    <VStack spacing={3}>
                      {teams
                        .sort((a, b) => b.matchScore - a.matchScore)
                        .map((team, index) => {
                          const originalIndex = teams.findIndex(t => t.name === team.name && t.players[0] === team.players[0]);
                          return (
                            <HStack key={index} w="100%" justify="space-between" p={2}>
                              <HStack>
                                <Badge
                                  bg={index === 0 ? '#FFD700' : '#C0C0C0'}
                                  color="#131925"
                                  px={2}
                                  py={1}
                                >
                                  {index + 1}º
                                </Badge>
                                <Text color="#FDFDFE" fontWeight="bold">
                                  {getDisplayTeamName(team, originalIndex >= 0 ? originalIndex : index)}
                                </Text>
                              </HStack>
                              <VStack spacing={0} align="end">
                                <Text color="#1ED0F4" fontSize="lg" fontWeight="bold">
                                  {team.matchScore} pontos
                                </Text>
                                <HStack spacing={1}>
                                  {team.roundScores.map((score, roundIndex) => (
                                    <Badge key={roundIndex} size="sm" bg="rgba(30, 208, 244, 0.3)">
                                      R{roundIndex + 1}: {score}
                                    </Badge>
                                  ))}
                                </HStack>
                              </VStack>
                            </HStack>
                          );
                        })}
                    </VStack>
                  </Box>

                  {/* Estatísticas Globais */}
                  <Box w="100%" p={4} bg="rgba(30, 208, 244, 0.05)" borderRadius="lg">
                    <Text fontSize="md" color="#1ED0F4" textAlign="center" mb={2}>
                      📊 Histórico de Vitórias
                    </Text>
                    <HStack justify="center" spacing={4}>
                      {teams.map((team, index) => (
                        <Text key={index} color="#FDFDFE" fontSize="sm">
                          {getDisplayTeamName(team, index)}: {getTeamWins(getDisplayTeamName(team, index))} vitória{getTeamWins(getDisplayTeamName(team, index)) !== 1 ? 's' : ''}
                        </Text>
                      ))}
                    </HStack>
                  </Box>
                </VStack>
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button 
                  bg="#1ED0F4"
                  color="#131925"
                  onClick={resetGame}
                  _hover={{ bg: 'rgba(30, 208, 244, 0.8)' }}
                  size="lg"
                >
                  Nova Partida
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