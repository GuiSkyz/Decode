import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { GameStats, MatchRecord } from '../hooks/useGameStats';

interface StatsDisplayProps {
  stats: GameStats;
  onResetStats: () => void;
}

function StatsDisplay({ stats, onResetStats }: StatsDisplayProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const topTeams = Object.entries(stats.teamWins)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <>
      <Button
        variant="outline"
        colorScheme="blue"
        size="sm"
        onClick={onOpen}
        color="#1ED0F4"
        borderColor="#1ED0F4"
        _hover={{ bg: 'rgba(30, 208, 244, 0.1)' }}
      >
        Ver Estatísticas
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="#131925" color="#FDFDFE">
          <ModalHeader color="#1ED0F4" textAlign="center">
            📊 Estatísticas do Jogo
          </ModalHeader>
          <ModalCloseButton color="#FDFDFE" />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              {/* Estatísticas Gerais */}
              <Box w="100%" p={4} bg="rgba(30, 208, 244, 0.1)" borderRadius="lg">
                <Text fontSize="lg" fontWeight="bold" mb={3} color="#1ED0F4">
                  Resumo Geral
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel color="#FDFDFE">Total de Partidas</StatLabel>
                    <StatNumber color="#1ED0F4">{stats.totalMatches}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color="#FDFDFE">Times Diferentes</StatLabel>
                    <StatNumber color="#1ED0F4">{Object.keys(stats.teamWins).length}</StatNumber>
                  </Stat>
                </SimpleGrid>
              </Box>

              {/* Ranking de Times */}
              {topTeams.length > 0 && (
                <Box w="100%" p={4} bg="rgba(30, 208, 244, 0.1)" borderRadius="lg">
                  <Text fontSize="lg" fontWeight="bold" mb={3} color="#1ED0F4">
                    🏆 Ranking de Vitórias
                  </Text>
                  <VStack spacing={2}>
                    {topTeams.map(([teamName, wins], index) => (
                      <HStack key={teamName} w="100%" justify="space-between">
                        <HStack>
                          <Badge
                            bg={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                            color="#131925"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {index + 1}º
                          </Badge>
                          <Text color="#FDFDFE">{teamName}</Text>
                        </HStack>
                        <Badge bg="#1ED0F4" color="#131925" px={2} py={1}>
                          {wins} vitória{wins > 1 ? 's' : ''}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Histórico Recente */}
              {stats.matchHistory.length > 0 && (
                <Box w="100%" p={4} bg="rgba(30, 208, 244, 0.1)" borderRadius="lg">
                  <Text fontSize="lg" fontWeight="bold" mb={3} color="#1ED0F4">
                    📈 Últimas Partidas
                  </Text>
                  <VStack spacing={2}>
                    {stats.matchHistory.slice(0, 5).map((match) => (
                      <Box key={match.id} w="100%" p={3} bg="rgba(30, 208, 244, 0.05)" borderRadius="md">
                        <HStack justify="space-between" mb={1}>
                          <Text color="#FDFDFE" fontSize="sm">
                            {new Date(match.date).toLocaleDateString('pt-BR')}
                          </Text>
                          <Badge bg="#1ED0F4" color="#131925">
                            {match.rounds} rodadas
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#FDFDFE" fontSize="sm" fontWeight="bold">
                            Vencedor: {match.winner}
                          </Text>
                          <Text color="#FDFDFE" fontSize="xs">
                            {match.teams.map(team => `${team.name}: ${team.finalScore}`).join(' | ')}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Botão Reset */}
              {stats.totalMatches > 0 && (
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja resetar todas as estatísticas?')) {
                      onResetStats();
                      onClose();
                    }
                  }}
                >
                  Resetar Estatísticas
                </Button>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default StatsDisplay;
