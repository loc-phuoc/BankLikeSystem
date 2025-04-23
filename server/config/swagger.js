import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Blockchain Banking API',
            version: '1.0.0',
            description: 'API for interacting with blockchain-based banking system',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.port}/api`,
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['username', 'address'],
                    properties: {
                        username: {
                            type: 'string',
                            description: 'User\'s unique username',
                        },
                        address: {
                            type: 'string',
                            description: 'Blockchain address of the user',
                        },
                        email: {
                            type: 'string',
                            description: 'User\'s email address',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation timestamp',
                        },
                        balance: {
                            type: 'string',
                            description: 'User\'s token balance',
                        },
                        privateKey: {
                            type: 'string',
                            description: 'Private key (only returned on user creation)',
                        },
                    },
                },
                Token: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Token name',
                        },
                        symbol: {
                            type: 'string',
                            description: 'Token symbol',
                        },
                        decimals: {
                            type: 'string',
                            description: 'Token decimals',
                        },
                        totalSupply: {
                            type: 'string',
                            description: 'Total token supply',
                        },
                        address: {
                            type: 'string',
                            description: 'Token contract address',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
            },
        },
    },
    apis: [
        './routes/*.js',
        './controllers/*.js',
    ],
};

const specs = swaggerJsdoc(options);

export default specs;