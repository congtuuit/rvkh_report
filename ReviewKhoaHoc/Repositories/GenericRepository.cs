using Microsoft.EntityFrameworkCore;
using ReviewKhoaHoc.Database;
using ReviewKhoaHoc.Interfaces;
using System.Linq.Expressions;

namespace ReviewKhoaHoc.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<List<T>> GetAllAsync() =>
            await _dbSet.AsNoTracking().ToListAsync();

        public async Task<T?> GetByIdAsync(object id) =>
            await _dbSet.FindAsync(id);

        public async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate) =>
            await _dbSet.Where(predicate).ToListAsync();

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            return Task.CompletedTask;
        }

        public Task<bool> AnyAsync(Expression<Func<T, bool>> predicate) => _dbSet.AnyAsync(predicate);

        public Task<int> ExecuteSqlRawAsync(string sql, params object[] parameters) => _context.Database.ExecuteSqlRawAsync(sql, parameters);

        public IQueryable<T> Query()
        {
            return _dbSet.AsNoTracking();
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }

}
