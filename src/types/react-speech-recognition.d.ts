declare module 'react-speech-recognition' {
    export interface SpeechRecognitionOptions {
        transcribing?: boolean;
        clearTranscriptOnListen?: boolean;
        commands?: any[];
        language?: string;
        continuous?: boolean;
    }

    export interface SpeechRecognition {
        startListening: (options?: SpeechRecognitionOptions) => Promise<void>;
        stopListening: () => Promise<void>;
        abortListening: () => Promise<void>;
        browserSupportsSpeechRecognition: boolean;
    }

    export const useSpeechRecognition: () => {
        transcript: string;
        interimTranscript: string;
        finalTranscript: string;
        listening: boolean;
        resetTranscript: () => void;
        browserSupportsSpeechRecognition: boolean;
        isMicrophoneAvailable: boolean;
    };

    const SpeechRecognition: SpeechRecognition;
    export default SpeechRecognition;
}
