import { forwardRef, type ElementType, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'ghost';

type ButtonProps = {
  as?: ElementType;
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>;

const variantToClass: Record<ButtonVariant, string> = {
  primary: 'btn btn--primary',
  ghost: 'btn btn--ghost',
};

const Button = forwardRef<HTMLElement, ButtonProps>(
  ({ children, variant = 'primary', className = '', as: Component = 'button', ...props }, ref) => {
    const MotionComponent = motion(Component as ElementType);
    const classes = [variantToClass[variant] || variantToClass.primary, className]
      .filter(Boolean)
      .join(' ');

    return (
      <MotionComponent
        ref={ref}
        className={classes}
        whileHover={{ y: -2, boxShadow: '0 18px 30px rgba(79, 70, 229, 0.28)' }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        {...props}
      >
        {children as ReactNode}
      </MotionComponent>
    );
  }
);

Button.displayName = 'Button';

export type { ButtonProps, ButtonVariant };
export default Button;
