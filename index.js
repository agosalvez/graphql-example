import { ApolloServer, UserInputError, gql } from 'apollo-server';
import { v4 as uuid } from 'uuid';

const persons = [
	{
		name: 'Ana',
		street: 'Calle Gran Vía, 123',
		city: 'Madrid',
		id: '3f5b5d0b-6e57-4f91-8471-2c8c0b3c2e9a'
	},
	{
		name: 'Carlos',
		phone: '+34 622 34 56 78', // Número de teléfono móvil en España
		street: 'Calle Alcalá, 456',
		city: 'Barcelona',
		id: '6b8b165b-fc65-4b5b-b6a8-85d667e05c91'
	},
	{
		name: 'Elena',
		phone: '+34 91 789 01 23',
		street: 'Avenida Diagonal, 789',
		city: 'Valencia',
		id: 'ac55df1a-86e8-4b13-91ea-bb81a3e42c52'
	}
];

const typeDefinitions = gql`
	enum YesNo {
		YES
		NO
	}
	type Address {
		street: String!
		city: String!
	}
	type Person {
		name: String!
		phone: String
		street: String!
		city: String!
		id: ID!
		address: Address!
	}
	type Query {
		personCount: Int!
		allPersons(phone: YesNo): [Person]!
		findPerson(name: String): Person
	}
	type Mutation {
		addPerson(
			name: String!
			phone: String
			street: String!
			city: String!
		): Person
		editNumber(name: String!, phone: String!): Person
	}
`;

const resolvers = {
	Query: {
		personCount: () => persons.length,
		allPersons: (root, args) => {
			if (!args.phone) return persons;

			const byPhone = (person) =>
				args.phone === 'YES' ? person.phone : !person.phone;

			return persons.filter(byPhone);
		},
		findPerson: (root, args) => {
			const { name } = args;
			return persons.find((person) => person.name === name);
		}
	},
	Mutation: {
		addPerson: (root, args) => {
			let id = undefined;
			if (persons.find((person) => person.name === args.name)) {
				throw new UserInputError('Name must be unique', {
					invalidArgs: args.name
				});
			} else {
				id = uuid();
			}
			const person = { ...args, id: id };
			persons.push(person);
			return person;
		},
		editNumber: (root, args) => {
			const personIndex = persons.findIndex(
				(person) => person.name === args.name
			);
			if (personIndex === -1) return null;

			const person = persons[personIndex];

			const updatedPerson = { ...person, phone: args.phone };
			persons[personIndex] = updatedPerson;
			return updatedPerson;
		}
	},
	Person: {
		address: (root) => {
			return {
				street: `${root.street}`,
				city: `${root.city}`
			};
		}
	}
};

const server = new ApolloServer({
	typeDefs: typeDefinitions,
	resolvers
});

server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
