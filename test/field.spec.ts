import { expect } from 'chai'
import 'mocha'

import { FormElement, Field, Option } from '../src/form'

describe('Test constructor', () => {
  it('should set the constructor parameters', () => {
    const options = [ new Option, new Option ]
    const field1 = new Field('boolean', 'field1', options)
    
    expect(field1.type).to.equal('boolean')
    expect(field1.name).to.equal('field1')
    expect(field1.options).to.equal(options)
    expect(field1.prototype).to.equal(null)

    const prototype = new FormElement('prototype')
    const field2 = new Field('object', 'field2', prototype)

    expect(field2.type).to.equal('object')
    expect(field2.name).to.equal('field2')
    expect(field2.prototype).to.equal(prototype)
    expect(field2.options.length).to.equal(0)
  })
})

describe('Test fieldPath', () => {

  it('should create the correct field path', () => {
    const root = new Field('string', 'root')
    const childWithName = new Field('string', 'childWithName')
    const childWithoutName = new Field('string')
    const childWithEmptyName = new Field('string', '')

    root.add(childWithName)
    root.add(childWithoutName)
    root.add(childWithEmptyName)

    expect(childWithName.fieldPath).to.equal('root.childWithName')
    expect(childWithoutName.fieldPath).to.equal('')
    expect(childWithEmptyName.fieldPath).to.equal('')
  })
  
  it('should create the correct field path in the third level', () => {
    const root = new Field('string', 'root')
    const childWithName1 = new Field('string', 'childWithName1')
    const childWithoutName1 = new Field('string')
    const childWithEmptyName1 = new Field('string', '')
    const childWithName2 = new Field('string', 'childWithName2')
    const childWithoutName2 = new Field('string')
    const childWithEmptyName2 = new Field('string', '')

    root.add(childWithName1)
    root.add(childWithoutName1)
    root.add(childWithEmptyName1)

    childWithName1.add(childWithName2)
    childWithName1.add(childWithoutName2)
    childWithName1.add(childWithEmptyName2)

    expect(childWithName2.fieldPath).to.equal('root.childWithName1.childWithName2')
    expect(childWithoutName2.fieldPath).to.equal('')
    expect(childWithEmptyName2.fieldPath).to.equal('')

    childWithoutName1.add(childWithName2)
    childWithoutName1.add(childWithoutName2)
    childWithoutName1.add(childWithEmptyName2)

    expect(childWithName2.fieldPath).to.equal('root.childWithName2')
    expect(childWithoutName2.fieldPath).to.equal('')
    expect(childWithEmptyName2.fieldPath).to.equal('')

    childWithEmptyName1.add(childWithName2)
    childWithEmptyName1.add(childWithoutName2)
    childWithEmptyName1.add(childWithEmptyName2)

    expect(childWithName2.fieldPath).to.equal('root.childWithName2')
    expect(childWithoutName2.fieldPath).to.equal('')
    expect(childWithEmptyName2.fieldPath).to.equal('')
  })

  it('should ignore elemets apart from fields', () => {
    const root = new Field('string', 'root')
    const element1 = new FormElement('element1')
    const field1 = new Field('string', 'field1')
    const element2 = new FormElement('element2')
    const field2 = new Field('string', 'field2')

    root.add(element1)
    element1.add(field1)
    field1.add(element2)
    element2.add(field2)

    expect(field1.fieldPath).to.equal('root.field1')
    expect(field2.fieldPath).to.equal('root.field1.field2')
  })

})

describe('Test findField', () => {
  
  it('should find a child by name', () => {
    const root = new Field('string', 'root')
    const child1 = new Field('string', 'child1')
    const child2 = new Field('string', 'child2')

    root.add(child1)
    child1.add(child2)

    const foundChild1 = root.find('child1')
    expect(foundChild1).to.equal(child1)

    const foundChild2 = root.find([ 'child1' ])
    expect(foundChild2).to.equal(child1)

    const foundChild3 = root.find('wrongName')
    expect(foundChild3).to.equal(null)

    const foundChild4 = root.find([ 'wrongName' ])
    expect(foundChild4).to.equal(null)

    const foundChild5 = root.find('')
    expect(foundChild5).to.equal(null)

    const foundChild6 = root.find([])
    expect(foundChild6).to.equal(null)

    const foundChild7 = root.find('child1.child2')
    expect(foundChild7).to.equal(child2)

    const foundChild8 = root.find([ 'child1', 'child2' ])
    expect(foundChild8).to.equal(child2)

    const foundChild9 = root.find('wrongName.child2')
    expect(foundChild9).to.equal(null)

    const foundChild10 = root.find([ 'wrongName', 'child2' ])
    expect(foundChild10).to.equal(null)

    const foundChild11 = root.find('child1.wrongName')
    expect(foundChild11).to.equal(null)

    const foundChild12 = root.find([ 'child1', 'wrongName' ])
    expect(foundChild12).to.equal(null)
  })

  it('should find a child even when there is one gap in the path', () => {
    const root = new Field('string', 'root')
    const child1 = new Field('string')
    const child2 = new Field('string', 'child2')
    const child3 = new Field('string', 'child3')

    root.add(child1)
    child1.add(child2)
    child2.add(child3)

    const foundChild1 = root.findField('child2')
    const foundChild2 = root.findField([ 'child2' ])

    expect(foundChild1).to.equal(child2)
    expect(foundChild2).to.equal(child2)

    const foundChild3 = root.findField('child2.child3')
    const foundChild4 = root.findField([ 'child2' , 'child3' ])

    expect(foundChild3).to.equal(child3)
    expect(foundChild4).to.equal(child3)    
  })

  it('should find a child even when there is a gap in the path', () => {
    const root = new Field('string', 'root')
    const child1 = new Field // gap
    const child11 = new Field('string', 'child11') // element after one gape
    const child111 = new Field('string', 'child111') // sub element of element after one gap
    const child112 = new Field // gap -> no gap -> gap
    const child1121 = new Field('string', 'child1121') // element after two gaps
    const child12 = new Field // gap -> gap
    const child121 = new Field('string', 'child121') // element after two gaps
    const child1211 = new Field('string', 'child1211') // sub element of element after two gaps
    const child111Duplicate = new Field('string', 'child111') // duplicate element in different branch of the tree

    root.add(child1)
    child1.add(child11)
    child11.add(child111)
    child11.add(child112)
    child112.add(child1121)
    child1.add(child12)
    child12.add(child121)
    child121.add(child1211)
    child121.add(child111Duplicate)

    // find child with a one level gap
    const foundChild1 = root.findField('child11')
    const foundChild2 = root.findField([ 'child11' ])
    expect(foundChild1).to.equal(child11)
    expect(foundChild2).to.equal(child11)

    // do not find child with a not existing name in the beginning of the path
    const foundChild3 = root.findField('wrongName.child11')
    const foundChild4 = root.findField([ 'wrongName' , 'child11' ])
    expect(foundChild3).to.equal(null)
    expect(foundChild4).to.equal(null)

    // do not find child with a not existing name in the end of the path
    const foundChild5 = root.findField('child11.wrongName')
    const foundChild6 = root.findField([ 'child11' , 'wrongName' ])
    expect(foundChild5).to.equal(null)
    expect(foundChild6).to.equal(null)

    // find a direct sub child of a child which is after a gap
    const foundChild7 = root.findField('child11.child111')
    const foundChild8 = root.findField([ 'child11', 'child111' ])
    expect(foundChild7).to.equal(child111)
    expect(foundChild8).to.equal(child111)

    // do not find a direct sub child of a child which is after a gap but which has a wrong name between the child and its sub child
    const foundChild9 = root.findField('child11.wrongName.child111')
    const foundChild10 = root.findField([ 'child11', 'wrongName', 'child111' ])
    expect(foundChild9).to.equal(null)
    expect(foundChild10).to.equal(null)

    // do not find a direct sub child of a child which is after a gap but which has a wrong name at the end
    const foundChild11 = root.findField('child12.child111.wrongName')
    const foundChild12 = root.findField([ 'child12', 'child111', 'wrongName' ])
    expect(foundChild11).to.equal(null)
    expect(foundChild12).to.equal(null)

    // find a child which comes after two gaps
    const foundChild15 = root.findField('child121')
    const foundChild16 = root.findField([ 'child121' ])
    expect(foundChild15).to.equal(child121)
    expect(foundChild16).to.equal(child121)

    // find a direct sub child of a child which is after two gaps
    const foundChild17 = root.findField('child121.child1211')
    const foundChild18 = root.findField([ 'child121', 'child1211' ])
    expect(foundChild17).to.equal(child1211)
    expect(foundChild18).to.equal(child1211)

    // do not find a dislocated child which got accidentally put into another branch
    const foundChild19 = root.findField('child1111')
    const foundChild20 = root.findField([ 'child1111' ])
    expect(foundChild19).to.equal(null)
    expect(foundChild20).to.equal(null)
  })

  it('should ignore non fields', () => {
    const root = new Field('string', 'root')
    const child1 = new FormElement // gap
    const child11 = new Field('string', 'child11') // element after one gape
    const child111 = new Field('string', 'child111') // sub element of element after one gap
    const child112 = new FormElement // gap -> no gap -> gap
    const child1121 = new Field('string', 'child1121') // element after two gaps
    const child12 = new FormElement // gap -> gap
    const child121 = new Field('string', 'child121') // element after two gaps
    const child1211 = new Field('string', 'child1211') // sub element of element after two gaps
    const child111Duplicate = new Field('string', 'child111') // duplicate element in different branch of the tree

    root.add(child1)
    child1.add(child11)
    child11.add(child111)
    child11.add(child112)
    child112.add(child1121)
    child1.add(child12)
    child12.add(child121)
    child121.add(child1211)
    child121.add(child111Duplicate)

    // find child with a one level gap
    const foundChild1 = root.findField('child11')
    const foundChild2 = root.findField([ 'child11' ])
    expect(foundChild1).to.equal(child11)
    expect(foundChild2).to.equal(child11)

    // do not find child with a not existing name in the beginning of the path
    const foundChild3 = root.findField('wrongName.child11')
    const foundChild4 = root.findField([ 'wrongName' , 'child11' ])
    expect(foundChild3).to.equal(null)
    expect(foundChild4).to.equal(null)

    // do not find child with a not existing name in the end of the path
    const foundChild5 = root.findField('child11.wrongName')
    const foundChild6 = root.findField([ 'child11' , 'wrongName' ])
    expect(foundChild5).to.equal(null)
    expect(foundChild6).to.equal(null)

    // find a direct sub child of a child which is after a gap
    const foundChild7 = root.findField('child11.child111')
    const foundChild8 = root.findField([ 'child11', 'child111' ])
    expect(foundChild7).to.equal(child111)
    expect(foundChild8).to.equal(child111)

    // do not find a direct sub child of a child which is after a gap but which has a wrong name between the child and its sub child
    const foundChild9 = root.findField('child11.wrongName.child111')
    const foundChild10 = root.findField([ 'child11', 'wrongName', 'child111' ])
    expect(foundChild9).to.equal(null)
    expect(foundChild10).to.equal(null)

    // do not find a direct sub child of a child which is after a gap but which has a wrong name at the end
    const foundChild11 = root.findField('child12.child111.wrongName')
    const foundChild12 = root.findField([ 'child12', 'child111', 'wrongName' ])
    expect(foundChild11).to.equal(null)
    expect(foundChild12).to.equal(null)

    // find a child which comes after two gaps
    const foundChild15 = root.findField('child121')
    const foundChild16 = root.findField([ 'child121' ])
    expect(foundChild15).to.equal(child121)
    expect(foundChild16).to.equal(child121)

    // find a direct sub child of a child which is after two gaps
    const foundChild17 = root.findField('child121.child1211')
    const foundChild18 = root.findField([ 'child121', 'child1211' ])
    expect(foundChild17).to.equal(child1211)
    expect(foundChild18).to.equal(child1211)

    // do not find a dislocated child which got accidentally put into another branch
    const foundChild19 = root.findField('child1111')
    const foundChild20 = root.findField([ 'child1111' ])
    expect(foundChild19).to.equal(null)
    expect(foundChild20).to.equal(null)
  })

})