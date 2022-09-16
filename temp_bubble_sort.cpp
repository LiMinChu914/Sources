#include<array>

template<int ...args>
struct CArray{
    static constexpr int arr[] = { args... };
};

template<int first, int ...args>
struct GetLength{
    enum{ length = GetLength<args...>::length + 1 };
};

template<int first>
struct GetLength<first>{
    enum{ length = 1 };
};

template<int ...args>
struct Array{
    enum{ length = GetLength<args...>::length}; 
    static const std::array<int, length> arr;
};

template<int ...args>
const std::array<int, Array<args...>::length> Array<args...>::arr = { args... };

template<int ...args>
struct List{
    template< template<int ...> class Container >
    struct Packing{
        using Result = Container<args...>;
    };
};

template<int size, int ...args>
struct Genindex{
    using Result = typename Genindex<size-1, size-1, args...>::Result;
};

template<int ...args>
struct Genindex<0, args...>{
    using Result = List< args... >;
};

template<class A, int i, int v>
struct SetElement{ 
    using Arr = typename A::template Packing<CArray>::Result;

    template<int ...index>
    struct Set{
        using Result = List<((index == i) ? v : Arr::arr[index])...>;
    };

    using Result = typename Genindex<A::template Packing<Array>::Result::length>::Result::template Packing<Set>::Result;
};


template<class A, int i, int j>
struct Swap{
    template<int ...index>
    struct Switch{
        using Result = List<(A::template Packing<CArray>::Result::arr[index])...>;
    };

    using Result = typename SetElement<typename SetElement<typename Genindex<A::template Packing<Array>::Result::length>::Result, i, j>::Result::Result, j, i>::Result::Result::template Packing<Switch>::Result;
};


template<bool v, class A, class B>
struct IF{};

template<class A, class B>
struct IF<true, A, B>{
    using Result = A;
};

template<class A, class B>
struct IF<false, A, B>{
    using Result = B;
};

template<class A>
struct BuubleSort{
    template<int i_start, int i_end, class B>
    struct loop_2{
        using Result = typename loop_2<i_start+1, i_end,  typename IF<(B::template Packing<CArray>::Result::arr[i_start] > B::template Packing<CArray>::Result::arr[i_start+1]), typename Swap<B, i_start, i_start+1>::Result::Result, B>::Result>::Result;
    };

    template<int i_end, class B>
    struct loop_2<i_end, i_end, B>{
        using Result = B;
    };

    template<int i_start, int i_end, class B>
    struct loop_1{
        using Result = loop_1<i_start, i_end-1, typename loop_2<i_start, i_end, B>::Result>::Result;
    };

    template<int i_start, class B>
    struct loop_1<i_start, i_start, B>{
        using Result = B;
    };


    using Result = typename loop_1<0, A::template Packing<Array>::Result::length-1, A>::Result;
};


#include<iostream>

int main() {
    BuubleSort<List<5,4,3,2,1,6,10,7,12,11,15,14,13,9,16>>::Result;
}
    