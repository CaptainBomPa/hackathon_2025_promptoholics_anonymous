import client from './client'

export const Api = {
    example: {
        list: () => client.get('/example'),
        get: id => client.get(`/example/${id}`),
        create: data => client.post('/example', data)
    }
}
