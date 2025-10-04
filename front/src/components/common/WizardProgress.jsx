// src/components/common/WizardProgress.jsx
import { Box } from '@mui/material'
import { Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, useTheme } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

export default function WizardProgress({ current = 1, steps = 3 }) {
    const theme = useTheme()
    const maxIdx = Math.max(0, Math.min(current - 1, steps - 1))

    const GreenConnector = (props) => (
        <StepConnector
            {...props}
            sx={{
                [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 24 },
                [`& .${stepConnectorClasses.line}`]: {
                    borderColor: theme.palette.success.main,
                    borderTopWidth: 3,
                    borderRadius: 2,
                    opacity: 0.9
                }
            }}
        />
    )

    const Dot = ({ active, completed, index }) => {
        const isLast = index === steps - 1
        const size = 28
        const border = active || completed ? theme.palette.success.main : theme.palette.divider
        const bg = active ? `${theme.palette.success.main}1A` : completed ? `${theme.palette.success.main}14` : theme.palette.background.paper
        return (
            <Box sx={{
                width: size, height: size, borderRadius: '50%',
                border: `2px solid ${border}`, bgcolor: bg,
                display: 'grid', placeItems: 'center', fontWeight: 700,
                color: active || completed ? theme.palette.success.main : theme.palette.text.secondary
            }}>
                {isLast ? <CheckIcon fontSize="small" /> : index + 1}
            </Box>
        )
    }

    const StepIconComponent = (props) => {
        const { active, completed, icon } = props
        return <Dot active={active} completed={completed} index={Number(icon) - 1} />
    }

    return (
        <Box sx={{ px: { xs: 0.5, md: 1 }, mb: 2 }}>
            <Stepper
                activeStep={maxIdx}
                alternativeLabel
                connector={<GreenConnector />}
                sx={{ '& .MuiStepLabel-label': { display: 'none' }, '& .MuiStep-root': { padding: { xs: 1, md: 1.5 } } }}
            >
                {Array.from({ length: steps }).map((_, i) => (
                    <Step key={i}><StepLabel StepIconComponent={StepIconComponent} /></Step>
                ))}
            </Stepper>
        </Box>
    )
}
