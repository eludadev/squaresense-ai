import { useEffect, useState } from 'react';

interface StreamingResponseHookProps {
  command: string;
}

const useStreamingResponse = ({ command }: StreamingResponseHookProps) => {
  const [currentText, setCurrentText] = useState<string>(''); // Current loaded text
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

  // Simulate a streaming response
  const simulateStreamingResponse = async () => {
    setIsLoading(true);
    setCurrentText(''); // Reset the current text

    // Simulated response from the server
    const simulatedResponse = `Simulated response for command: "${command}"`;

    for (let i = 0; i < simulatedResponse.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulated delay
      setCurrentText((prevText) => prevText + simulatedResponse[i]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    simulateStreamingResponse();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  return { currentText, isLoading, restart: simulateStreamingResponse };
};

export default useStreamingResponse;
