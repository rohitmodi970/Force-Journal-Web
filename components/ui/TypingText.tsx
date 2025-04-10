import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
    useRef,
  } from "react";
  import {
    motion,
    AnimatePresence,
  } from "framer-motion";
  
  function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(" ");
  }
  
  export interface TypingTextRef {
    next: () => void;
    previous: () => void;
    jumpTo: (index: number) => void;
    reset: () => void;
    pause: () => void;
    resume: () => void;
  }
  
  export interface TypingTextProps
    extends Omit<
      React.ComponentPropsWithoutRef<typeof motion.span>,
      "children" | "transition" | "initial" | "animate" | "exit"
    > {
    texts: string[];
    typingSpeed?: number;
    pauseDuration?: number;
    cursorCharacter?: string;
    showCursor?: boolean;
    loop?: boolean;
    auto?: boolean;
    onComplete?: () => void;
    onTextComplete?: (index: number) => void;
    onNext?: (index: number) => void;
    mainClassName?: string;
    cursorClassName?: string;
    characterClassName?: string;
    wordClassName?: string;
  }
  
  const TypingText = forwardRef<TypingTextRef, TypingTextProps>(
    (
      {
        texts,
        typingSpeed = 100,
        pauseDuration = 1000,
        cursorCharacter = "|",
        showCursor = true,
        loop = true,
        auto = true,
        onComplete,
        onTextComplete,
        onNext,
        mainClassName,
        cursorClassName,
        characterClassName,
        wordClassName,
        ...rest
      },
      ref
    ) => {
      const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
      const [typedCharCount, setTypedCharCount] = useState<number>(0);
      const [isPaused, setIsPaused] = useState<boolean>(false);
      const [isComplete, setIsComplete] = useState<boolean>(false);
      const [cursorVisible, setCursorVisible] = useState<boolean>(true);
      const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
      const currentText = texts[currentTextIndex];
      
      // Process the text into words for display
      const words = currentText.split(" ");
      
      // Calculate which characters have been typed so far
      const processedWords = words.map((word, wordIndex) => {
        // Calculate the starting character position for this word
        let startPos = 0;
        for (let i = 0; i < wordIndex; i++) {
          startPos += words[i].length + 1; // +1 for the space
        }
        
        // Calculate how many characters of this word should be visible
        const charsToShow = Math.max(0, Math.min(typedCharCount - startPos, word.length));
        
        return {
          word,
          visible: word.substring(0, charsToShow),
          isFullyVisible: charsToShow === word.length,
          showSpace: wordIndex < words.length - 1 && (typedCharCount > startPos + word.length)
        };
      });
  
      // Cursor blinking effect
      useEffect(() => {
        const cursorInterval = setInterval(() => {
          setCursorVisible((prev) => !prev);
        }, 530); // Standard cursor blink rate
  
        return () => clearInterval(cursorInterval);
      }, []);
  
      const typeNextChar = useCallback(() => {
        if (isPaused) return;
  
        setTypedCharCount((current) => {
          if (current < currentText.length) {
            return current + 1;
          }
          return current;
        });
      }, [currentText, isPaused]);
  
      // Handle typing animation
      useEffect(() => {
        if (isPaused || typedCharCount >= currentText.length) return;
  
        timeoutRef.current = setTimeout(() => {
          typeNextChar();
        }, typingSpeed);
  
        return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
      }, [typedCharCount, currentText, typeNextChar, typingSpeed, isPaused]);
  
      // Handle text completion
      useEffect(() => {
        if (typedCharCount === currentText.length && typedCharCount > 0) {
          if (onTextComplete) {
            onTextComplete(currentTextIndex);
          }
  
          if (auto) {
            timeoutRef.current = setTimeout(() => {
              if (currentTextIndex === texts.length - 1 && !loop) {
                setIsComplete(true);
                if (onComplete) onComplete();
              } else {
                next();
              }
            }, pauseDuration);
  
            return () => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
          }
        }
      }, [typedCharCount, currentText.length, currentTextIndex, texts.length, auto, pauseDuration, loop, onTextComplete, onComplete]);
  
      const handleIndexChange = useCallback(
        (newIndex: number) => {
          setCurrentTextIndex(newIndex);
          setTypedCharCount(0);
          if (onNext) onNext(newIndex);
        },
        [onNext]
      );
  
      const next = useCallback(() => {
        const nextIndex =
          currentTextIndex === texts.length - 1
            ? loop
              ? 0
              : currentTextIndex
            : currentTextIndex + 1;
        if (nextIndex !== currentTextIndex) {
          handleIndexChange(nextIndex);
        }
      }, [currentTextIndex, texts.length, loop, handleIndexChange]);
  
      const previous = useCallback(() => {
        const prevIndex =
          currentTextIndex === 0
            ? loop
              ? texts.length - 1
              : currentTextIndex
            : currentTextIndex - 1;
        if (prevIndex !== currentTextIndex) {
          handleIndexChange(prevIndex);
        }
      }, [currentTextIndex, texts.length, loop, handleIndexChange]);
  
      const jumpTo = useCallback(
        (index: number) => {
          const validIndex = Math.max(0, Math.min(index, texts.length - 1));
          if (validIndex !== currentTextIndex) {
            handleIndexChange(validIndex);
          }
        },
        [texts.length, currentTextIndex, handleIndexChange]
      );
  
      const reset = useCallback(() => {
        handleIndexChange(0);
        setIsComplete(false);
      }, [handleIndexChange]);
  
      const pause = useCallback(() => {
        setIsPaused(true);
      }, []);
  
      const resume = useCallback(() => {
        setIsPaused(false);
      }, []);
  
      useImperativeHandle(
        ref,
        () => ({
          next,
          previous,
          jumpTo,
          reset,
          pause,
          resume,
        }),
        [next, previous, jumpTo, reset, pause, resume]
      );
  
      // Calculate cursor position
      const getCursorPosition = () => {
        // Find the last visible word
        const lastVisibleWordIndex = processedWords.findIndex(
          (wordData, index) => {
            if (index === processedWords.length - 1) {
              return wordData.visible.length < wordData.word.length;
            }
            return !wordData.isFullyVisible;
          }
        );
  
        // If all words are fully visible, place cursor at end
        if (lastVisibleWordIndex === -1) {
          return processedWords.length - 1;
        }
  
        return lastVisibleWordIndex;
      };
  
      const cursorPosition = getCursorPosition();
  
      return (
        <motion.span
          className={cn("inline-flex flex-wrap whitespace-pre-wrap", mainClassName)}
          {...rest}
        >
          <AnimatePresence>
            {processedWords.map((wordData, wordIndex) => (
              <React.Fragment key={`${currentTextIndex}-${wordIndex}`}>
                <motion.span 
                  className={cn("inline-block", wordClassName)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {wordData.visible.split("").map((char, charIndex) => (
                    <motion.span
                      key={`${wordIndex}-${charIndex}`}
                      className={cn("inline-block", characterClassName)}
                    >
                      {char}
                    </motion.span>
                  ))}
                  {showCursor && wordIndex === cursorPosition && (
                    <motion.span
                      className={cn("inline-block", cursorClassName)}
                      animate={{ opacity: cursorVisible ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {cursorCharacter}
                    </motion.span>
                  )}
                </motion.span>
                {/* Add space between words */}
                {wordData.showSpace && (
                  <span className="whitespace-pre"> </span>
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </motion.span>
      );
    }
  );
  
  TypingText.displayName = "TypingText";
  export default TypingText;