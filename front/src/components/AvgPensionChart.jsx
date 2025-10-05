import React from 'react'
import { Box, Paper, Typography, useTheme } from '@mui/material'
import {
    ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar
} from 'recharts'

/**
 * AvgPensionChart
 * Props:
 * - data: Array<{ id, name, short, female, male, base, avg }>
 * - currencyFormatter: Intl.NumberFormat instance (np. pl-PL PLN)
 */
export default function AvgPensionChart({ data, currencyFormatter }) {
    const theme = useTheme()
    const nf = currencyFormatter

    const tooltipContent = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null
        const p = payload[0].payload
        return (
            <Paper sx={{ p: 1.25 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {p.name || label}
                </Typography>
                <Typography variant="body2">Średnia: {nf.format(p.avg)}</Typography>
                {typeof p.female === 'number' && (
                    <Typography variant="body2">Kobiety: {nf.format(p.female)}</Typography>
                )}
                {typeof p.male === 'number' && (
                    <Typography variant="body2">Mężczyźni: {nf.format(p.male)}</Typography>
                )}
                {typeof p.base === 'number' && (
                    <Typography variant="body2">Podstawa składek: {nf.format(p.base)}</Typography>
                )}
            </Paper>
        )
    }

    return (
        <Box component="section" sx={{ mt: { xs: 3, md: 4 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 1,
                    bgcolor: (t) =>
                        t.palette.mode === 'dark'
                            ? 'rgba(20,24,36,0.70)'
                            : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'saturate(180%) blur(6px)',
                    boxShadow: (t) => t.shadows[3],
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    Średnie emerytury wg tytułu ubezpieczenia
                </Typography>

                <Box sx={{ width: '100%', height: 420 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={data}
                            margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={theme.palette.divider}
                                opacity={0.4}
                            />
                            <XAxis
                                dataKey="short"
                                interval={0}
                                height={70}
                                angle={-25}
                                textAnchor="end"
                                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                            />
                            <YAxis
                                tickFormatter={(v) => nf.format(v)}
                                width={90}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip content={tooltipContent} />
                            <Bar
                                dataKey="avg"
                                fill={theme.palette.success.main}
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        </Box>
    )
}
