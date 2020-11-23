import { FastifySchema } from 'fastify';
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import AbstractAction, { Request } from '../AbstractAction'
import ContractFunction from '../transactions/ContractFunction'
import Provider from '../../src/provider/Provider'

export default abstract class AbstractTransaction extends AbstractAction {
    /**
     * The function ABI used to create a transaction
     * 
     * @property {Object} functionABI
     * 
     * @protected
     */
    protected functionABI: any // TODO: Create functionABI object interface definition 

    /**
     * The contract function
     * 
     * @property {ContractFunction} contractFunction
     * 
     * @private
     */
    private contractFunction: ContractFunction

    /**
     * @param {Provider} provider - The Ethereum provider object
     * @param {Request} request - The request body given by the user
     * 
     * @constructor
     */
    constructor(
        private provider: Provider,
        request: Request
    ) {
        super(request);
        this.contractFunction = new ContractFunction(this.functionABI, request.message)
    }

    /**
     * Executes the transaction and returns the TransactionReceipt
     * 
     * @method execute
     * 
     * @returns {Promise<TransactionReceipt>} 
     * 
     * @public
     */
    public execute(): Promise<TransactionReceipt> {
        return this.provider.sendTransaction(this.contractFunction)
    } 

    /**
     * TODO: Define response validation
     * 
     * Returns the schema of a transaction command
     * 
     * @property {FastifySchema} schema
     * 
     * @returns {FastifySchema}
     */
    public static get schema(): FastifySchema {
        return super.schema
    }
}
