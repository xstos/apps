function op(name,...args) {

}
op('pipe')(
    op('list')('0,1,2,3,4', '5,6,7,8,9'),
    op('concat'), //A1=concat('0,...','5,..')
    op('split')(','), //A2=split(A1)
    op('>')(1,2,3) //A3=0>1, 1>1
)