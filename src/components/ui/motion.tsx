"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface MotionComponentProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export const FadeIn: React.FC<MotionComponentProps> = ({
    children,
    delay = 0,
    duration = 0.5,
    className,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={cn("w-full", className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const SlideIn: React.FC<MotionComponentProps & { direction?: "left" | "right" | "up" | "down" }> = ({
    children,
    delay = 0,
    duration = 0.5,
    direction = "up",
    className,
    ...props
}) => {
    const variants = {
        hidden: {
            opacity: 0,
            x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
        },
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ duration, delay, ease: "easeOut" }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const ScaleIn: React.FC<MotionComponentProps> = ({
    children,
    delay = 0,
    duration = 0.4,
    className,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration, delay, type: "spring", stiffness: 100 }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};
