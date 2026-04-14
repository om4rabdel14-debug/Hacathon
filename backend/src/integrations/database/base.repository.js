const { supabase } = require('./supabase.client');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = supabase;
  }

  async findById(id) {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(options = {}) {
    let query = this.db.from(this.tableName).select('*', { count: 'exact' });

    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      }
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false });
    }

    if (options.limit) {
      const offset = ((options.page || 1) - 1) * options.limit;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  }

  async insert(record) {
    const { data, error } = await this.db
      .from(this.tableName)
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await this.db
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await this.db
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

module.exports = BaseRepository;
