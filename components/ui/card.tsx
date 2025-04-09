import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-4',
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return (
    <h2
      className={clsx(
        'text-xl font-semibold text-gray-800 dark:text-gray-100',
        className
      )}
    >
      {children}
    </h2>
  );
};

interface CardDescriptionProps {
  className?: string;
  children: ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, children }) => {
  return (
    <p
      className={clsx(
        'text-sm text-gray-500 dark:text-gray-400 mt-1',
        className
      )}
    >
      {children}
    </p>
  );
};

interface CardContentProps {
  className?: string;
  children: ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return (
    <div className={clsx('mt-2', className)}>
      {children}
    </div>
  );
};