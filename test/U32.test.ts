import { U32 } from '../lib/binaryProvider/U32';
 
import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
mocha.describe('Test U32 container', () => {

    it('Can create an U32 container', () => {
        let newU32 = new U32();
        expect(newU32).not.null
        expect(newU32).not.undefined
    });

});
