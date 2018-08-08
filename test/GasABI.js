'use strict'

contract('GasABI', () => {
  const GasABI = artifacts.require('./GasABI.sol')
  let gs

  beforeEach(async () => {
    gs = await GasABI.new()
  })
  describe('splitting arrays', () => {
    const encoded = '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000';

    it('costs less than 300 gas to parse', async () => {
      const tx1 = await gs.singleArray(encoded)
      const tx2 = await gs.doubleArray('0x31', '0x32')
      const rec1  = await web3.eth.getTransactionReceipt(tx1.tx)
      const rec2  = await web3.eth.getTransactionReceipt(tx2.tx)

      assert.equal(rec1.logs[0].data, rec2.logs[0].data)
      assert.equal(tx1.receipt.gasUsed, 26334)
      assert.equal(tx2.receipt.gasUsed, 26040)
    })

    it('costs over 600 gas as an extra parameter', async () => {
      const tx1 = await gs.emptySingle('')
      const tx2 = await gs.emptyDouble('', '')

      assert.equal(tx1.receipt.gasUsed, 22184)
      assert.equal(tx2.receipt.gasUsed, 22777)
    })
  })

  describe('more real world params', () => {
    const encoded = '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000221220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000221220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2000000000000000000000000000000000000000000000000000000000000'

    it('most optimized parsing solution costs 301 more than result + metadata', async () => {
      const tx1 = await gs.singleArray2(encoded)
      const tx2 = await gs.doubleArray('0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2', '0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2')
      const rec1  = await web3.eth.getTransactionReceipt(tx1.tx)
      const rec2  = await web3.eth.getTransactionReceipt(tx2.tx)

			// console.log(rec1.logs[0].data)
      // console.log(tx1.receipt.gasUsed)
      // console.log(tx2.receipt.gasUsed)
      assert.equal(rec1.logs[0].data, rec2.logs[0].data)
      assert.equal(tx1.receipt.gasUsed, 31501)
      assert.equal(tx2.receipt.gasUsed, 31200)
    })

    it(`Oracles with extra metadata bytes parameter costs ${27800 - 27537} less vs single cumulative bytes`, async () => {
      // proposed single bytes solution
      const tx1 = await gs.emptySingle(encoded)
      // proposed result + metadata bytes solution for Oracles utilizing metadata
      const tx2 = await gs.emptyDouble('0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2', '0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2')

      assert.equal(tx1.receipt.gasUsed, 27800)
      assert.equal(tx2.receipt.gasUsed, 27537)
    })
    it(`Oracles without extra metadata bytes parameter costs ${25157 - 24534} more vs single bytes`, async () => {
      // proposed single bytes solution
      const tx1 = await gs.emptySingle('0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2')
      // proposed result + metatadata solution for Oracles not utilizing metadata
      const tx2 = await gs.emptyDouble('0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2', '')

      //console.log(tx1.receipt.gasUsed)
      //console.log(tx2.receipt.gasUsed)
      assert.equal(tx1.receipt.gasUsed, 24564)
      assert.equal(tx2.receipt.gasUsed, 25157)
    })
    it(`Single cumulative bytes solution - ${27816 - 24564} more costly for metadata oracles`, async () => {
      // Non-metadata Oracle costs
      const tx1 = await gs.emptySingle('0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2')
      // metadata Oracle costs
      const tx2 = await gs.emptyParseSingle(encoded)

      assert.equal(tx1.receipt.gasUsed, 24564)
      assert.equal(tx2.receipt.gasUsed, 27816)
    })
    it(`result + metadata solution - ${27537 - 25157} more costly for metadata oracles`, async () => {
      // Non-metadata Oracle costs
      const tx1 = await gs.emptyDouble('0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2', '')
      // metadata Oracle costs
      const tx2 = await gs.emptyDouble('0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2', '0x1220ac89cc6371f915404502e7daae279d108a294b2ae6efd84f6afac28ad52715d2')

      assert.equal(tx1.receipt.gasUsed, 25157)
      assert.equal(tx2.receipt.gasUsed, 27537)
      // almost 300 gas more efficient for metadata Oracles, whilst non-metadata oracles still achieve efficiency
      // of over 2000 gas over their metadata counterparts
    })
  })
})
