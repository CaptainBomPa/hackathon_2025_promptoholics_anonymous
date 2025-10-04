import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigationType } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'

export default function PageTransition({ children }) {
    const location = useLocation()
    const navType = useNavigationType()
    const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
    const first = useRef(true)
    const dir = navType === 'POP' ? -1 : 1

    useEffect(() => { first.current = false }, [location.pathname])

    const variants = {
        initial: ({ dir, first }) => first
            ? { opacity: 1, x: 0, filter: 'blur(0px)' }
            : { opacity: 0, x: dir * 24, filter: 'blur(2px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: reduce ? 0 : 0.28, ease: [0.22,1,0.36,1] } },
        exit: ({ dir }) => ({ opacity: 0, x: -dir * 24, filter: 'blur(2px)', transition: { duration: reduce ? 0 : 0.22, ease: [0.4,0,1,1] } })
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                custom={{ dir, first: first.current }}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ minHeight: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
