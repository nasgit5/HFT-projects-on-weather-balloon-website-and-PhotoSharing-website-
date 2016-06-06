import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

public class ClassUnderTestTests {

    private ClassUnderTest o;

    @Before
    public void setUp() {
        o = new ClassUnderTest();
    }

    @Test
    public void testFunctionUnderTest_testCase1() {
        Assert.assertEquals(1, o.functionUnderTest(1));
    }

    @Test
    public void testFunctionUnderTest_testCase2() {
        Assert.assertEquals(2, o.functionUnderTest(2));
    }
}