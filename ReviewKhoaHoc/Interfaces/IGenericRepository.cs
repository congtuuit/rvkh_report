using System.Linq.Expressions;

namespace ReviewKhoaHoc.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        Task<List<T>> GetAllAsync();
        Task<T?> GetByIdAsync(object id);
        Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);

        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);

        Task<int> ExecuteSqlRawAsync(string sql, params object[] parameters);

        IQueryable<T> Query();

        Task SaveChangesAsync();
    }

}
