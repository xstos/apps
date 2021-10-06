using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeneratorUsageExample
{
    class Program
    {
        static void Main(string[] args)
        {
            var imavariable = 2;
        }
    }

    public class IocAttribute : Attribute
    {

    }

    [Ioc]
    public interface IInjectableService
    {

    }

    [Ioc]
    public class InjectableServiceImpl : IInjectableService
    {

    }
}

class ImGlobalYay
{

}
