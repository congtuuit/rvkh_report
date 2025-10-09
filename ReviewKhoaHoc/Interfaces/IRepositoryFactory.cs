namespace ReviewKhoaHoc.Interfaces
{
    public interface IRepositoryFactory
    {
        IGenericRepository<T> CreateRepository<T>() where T : class;
    }

}
