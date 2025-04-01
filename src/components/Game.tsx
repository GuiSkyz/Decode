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
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import Instructions from './Instructions';

const GAME_TIME = 120; // 2 minutos em segundos
const ALL_WORDS = [
  // Conceitos Básicos
  'Empreendedor', 'Inovação', 'Startup', 'Liderança', 'Estratégia',
  'Networking', 'Investimento', 'Marketing', 'Planejamento', 'Crescimento',
  
  // Termos Financeiros
  'Bootstrapping', 'Valuation', 'Faturamento', 'Receita', 'Margem',
  'Investidor-anjo', 'Venture Capital', 'Seed Money', 'Crowdfunding', 'ROI',
  'Break-even', 'Fluxo de Caixa', 'Capital de Giro', 'Patrimônio', 'Lucro',
  
  // Gestão e Processos
  'KPI', 'Indicadores', 'Processos', 'Gestão', 'Governança',
  'Compliance', 'Produtividade', 'Eficiência', 'Organograma', 'Hierarquia',
  
  // Marketing e Vendas
  'Branding', 'Lead', 'Conversão', 'Funil', 'CRM',
  'Marketing Digital', 'SEO', 'Persona', 'Público-alvo', 'Copywriting',
  
  // Metodologias
  'Scrum', 'Agile', 'Lean Startup', 'Canvas', 'Design Thinking',
  'OKR', 'Kaizen', 'Kanban', 'Sprints', 'MVP',
  
  // Termos de Negócio
  'Pitch', 'Escalabilidade', 'Pivotagem', 'Disrupção', 'Proposta de Valor',
  'B2B', 'B2C', 'D2C', 'Marketplace', 'Franquia',
  
  // Ecossistema
  'Aceleradora', 'Incubadora', 'Coworking', 'Hub', 'Mentoria',
  'Unicórnio', 'Scale-up', 'Stakeholder', 'Parceria', 'Joint Venture',
  
  // Inovação
  'Transformação Digital', 'Blockchain', 'Inteligência Artificial', 'IoT', 'Big Data',
  'Open Innovation', 'Prototipagem', 'Validação', 'Early Adopter', 'Tendências',
  
  // Soft Skills
  'Resiliência', 'Mindset', 'Proatividade', 'Adaptabilidade', 'Criatividade',
  'Negociação', 'Persuasão', 'Comunicação', 'Empatia', 'Colaboração',
  
  // Documentos e Apresentações
  'Pitch Deck', 'Business Plan', 'Relatório', 'Demonstrativo', 'Contrato',
  'Termo Sheet', 'NDA', 'Estatuto', 'Sociedade', 'Due Diligence'
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
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <Heading color="brand.primary">Decode - Jogo de Palavras</Heading>
        
        {!gameStarted && !showVictoryModal && <Instructions />}
        
        <Box w="100%" p={6} bg="brand.accent" borderRadius="lg">
          <VStack spacing={4}>
            <Text fontSize="xl">
              Tempo Restante: {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </Text>
            
            <HStack spacing={4}>
              {teams.map((team: Team, index: number) => (
                <Badge
                  key={team.name}
                  colorScheme={currentTeam === index + 1 ? 'blue' : 'gray'}
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
            colorScheme="blue"
            size="lg"
            onClick={startGame}
          >
            Iniciar Rodada
          </Button>
        ) : !showVictoryModal && (
          <VStack spacing={4} w="100%">
            {showWords && (
              <Box w="100%" p={4} bg="white" borderRadius="md" boxShadow="sm">
                <VStack spacing={2}>
                  {teams[currentTeam - 1].availableWords.map((word) => {
                    const isUsed = teams[currentTeam - 1].usedWords.includes(word);
                    return (
                      <Button
                        key={word}
                        w="100%"
                        variant="outline"
                        isDisabled={isUsed}
                        bg={isUsed ? 'green.50' : 'white'}
                        color={isUsed ? 'green.600' : 'brand.secondary'}
                        borderColor={isUsed ? 'green.500' : 'gray.200'}
                        _hover={{
                          bg: isUsed ? 'green.50' : 'gray.50',
                          borderColor: isUsed ? 'green.500' : 'gray.300',
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
                            color="green.500"
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
              colorScheme="red"
              onClick={endTurn}
            >
              Encerrar Turno
            </Button>
          </VStack>
        )}

        <Modal isOpen={showSetupModal} onClose={() => {}} isCentered>
          <ModalOverlay />
          <ModalContent p={4}>
            <ModalHeader textAlign="center" color="brand.primary">
              Configurar Times
            </ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                {teams.map((team, teamIndex) => (
                  <Box key={teamIndex} w="100%">
                    <FormControl>
                      <FormLabel>Nome do Time {teamIndex + 1}</FormLabel>
                      <Input
                        placeholder={`Time ${teamIndex + 1}`}
                        value={team.name}
                        onChange={(e) => updateTeamName(teamIndex, e.target.value)}
                      />
                    </FormControl>
                    <HStack mt={2}>
                      <FormControl>
                        <FormLabel>Jogador 1</FormLabel>
                        <Input
                          placeholder="Nome do jogador 1"
                          value={team.players[0]}
                          onChange={(e) => updatePlayerName(teamIndex, 0, e.target.value)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Jogador 2</FormLabel>
                        <Input
                          placeholder="Nome do jogador 2"
                          value={team.players[1]}
                          onChange={(e) => updatePlayerName(teamIndex, 1, e.target.value)}
                        />
                      </FormControl>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter justifyContent="center">
              <Button colorScheme="blue" onClick={handleSetupTeams}>
                Começar Jogo
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={showVictoryModal} onClose={() => {}} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader textAlign="center" color="brand.primary">
              🎉 Parabéns! 🎉
            </ModalHeader>
            <ModalBody>
              <Text fontSize="xl" textAlign="center">
                {winner?.name} venceu o jogo com {winner?.score} pontos!
                {winner?.players[0] && winner?.players[1] && (
                  <Text mt={2} fontSize="lg">
                    Parabéns {winner.players[0]} e {winner.players[1]}!
                  </Text>
                )}
              </Text>
            </ModalBody>
            <ModalFooter justifyContent="center">
              <Button colorScheme="blue" onClick={resetGame}>
                Jogar Novamente
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}

export default Game; 