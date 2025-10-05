import { Box, Button, Container, Stack, Typography } from '@mui/material'
import TimelineIcon from '@mui/icons-material/Timeline'
import ContrastIcon from '@mui/icons-material/Contrast'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useUiPrefs } from '../../contexts/UiPrefsContext'

export default function AppHeader({ canGo = true, onStart }) {
    const { toggleMode, incFont, decFont } = useUiPrefs()

    return (
        <Box
            component="header"
            sx={{
                width: '100%',
                height: '100px',
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#000' : '#fff'),
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
                <Box
                    sx={{
                        maxWidth: 1280,
                        mx: 'auto',
                        py: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                            component="img"
                            src="/zus-logo.png"        // plik w public/
                            alt="ZUS logo"
                            sx={{
                                width: 64,
                                height: 64,
                                objectFit: 'cover',
                                borderRadius: 1,
                            }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            ZUS • Symulator emerytalny
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Button size="small" startIcon={<ContrastIcon />} onClick={toggleMode} variant="outlined">Kontrast</Button>
                        <Button size="small" startIcon={<AddIcon />} onClick={incFont} variant="outlined">A</Button>
                        <Button size="small" startIcon={<RemoveIcon />} onClick={decFont} variant="outlined">A</Button>
                        <Button size="small" startIcon={<PlayArrowIcon />} onClick={onStart} variant="contained" disabled={!canGo}>Rozpocznij</Button>
                    </Stack>
                </Box>
            </Container>
        </Box>
    )
}
