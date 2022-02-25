using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace KriterisEngine
{
    public static partial class Common
    {
        public static Action<object, object> _BuildSetterForStruct(this FieldInfo field)
        {
            if (field.Attributes.HasFlag(FieldAttributes.InitOnly))
            {
                return field.SetValue;
            }
            var instance = Expression.Parameter(typeof (object));
            var value = Expression.Parameter(typeof (object));

            var body =
                Expression.Block(typeof (void),
                    Expression.Assign(
                        Expression.Field(
                            Expression.Unbox(instance, field.DeclaringType),field),
                        Expression.Convert(value, field.FieldType)));

            return Expression.Lambda<Action<object, object>>(body, instance, value).Compile();
        }

        public static Action<object,object> _BuildSetterForClass(this FieldInfo field)
        {
            if (field.Attributes.HasFlag(FieldAttributes.InitOnly))
            {
                return field.SetValue;
            }
            var instance = Expression.Parameter(typeof(object), "instance");
            var value = Expression.Parameter(typeof(object), "value");

            var expr =
                Expression.Lambda<Action<object, object>>(
                    Expression.Assign(
                        Expression.Field(Expression.Convert(instance,field.ReflectedType), field),
                        Expression.Convert(value, field.FieldType)),
                    instance,
                    value);

            return expr.Compile();
        }

        public static Action<object, object> _CreateNonStaticSetter(this FieldInfo field)
        {
            var reflectedType = field.ReflectedType;
            return reflectedType.IsValueType ? _BuildSetterForStruct(field) : _BuildSetterForClass(field);
        }

        public static Func<object, object> _CreateNonStaticGetter(this FieldInfo field)
        {
            var instance = Expression.Parameter(typeof(object));
            var propExpr = Expression.Field(Expression.Convert(instance, field.ReflectedType), field);
            var castExpr = Expression.Convert(propExpr, typeof(object));
            var body = Expression.Lambda<Func<object, object>>(castExpr, instance);

            return body.Compile();
        }
    }
}
