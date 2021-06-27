// Example program
#include <iostream>
#include <string>
enum Func { concat };
enum Type { str };
struct Variant
{
    Type type;
    void* value;
	bool has_value() const
	{
        return value != nullptr;
	}
    Variant(char const* s)
    {
        type = str;
        value = new std::string(s);
    }
    // Variant(std::string s)
    // {
    //     type = str;
    //     value = new std::string(s);
    // }
    void operator =(std::string s) const
    {
        if (has_value())
        {
            delete value;
        }
    }
	Variant()
    {
        type = str;
        value = nullptr;
    }
};

struct Pipe {
    Variant lhs, rhs;
	
    Func f;
	Pipe()
    {
        f = concat;
    }
	Pipe eval()
    {
        Pipe ret2;
	    switch (f)
	    {
		    case concat:
                auto p1 = (std::string*)lhs.value;
                auto p2 = (std::string*)rhs.value;
                ret2.lhs = *p1 + *p2;
                return ret2;
	    }
        return ret2;
    }
};
int x = 0;
auto lam = [&] { std::cout << x << '\n'; };

Pipe operator >>(char const* str, Pipe l) {
    std::cout << x;
    
    return l;
}
Pipe& operator |(Pipe& l, char const* str) {
    if (!l.lhs.has_value()) {
        l.lhs = str;
        return l;
    }
	if (!l.rhs.has_value())
	{
        l.rhs = str;
        return l.eval();
	}
    return l;
}
Pipe operator |(Pipe l, int x) {
    std::cout << x;
    return l;
}
Pipe& operator |(Pipe& l, Func f) {
    std::cout << f;
    l.f = f;
    return l;
}
Pipe o;

int main()
{
    
    o | "hello" | concat | " world";
    
}
